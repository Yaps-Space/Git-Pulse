import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs, doc, serverTimestamp, getDoc } from "firebase/firestore"
import {
  GithubIssue, GithubPR, DatedCommitCount,
  computeCommitStats, computeAvgCloseTime, buildFeatures, callMLService, buildMonthlyStats, upsertRepo,
  fetchContributorStats, padWeeksTo52, aggregateContributorWeeks, adjustHealthForActivity,
} from "@/shared/lib/analyzeUtils"

interface GitlabActor {
  author?: { username?: string }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { fullName, provider, repoId } = await req.json()
  const [owner, repo] = fullName.split("/")

  try {
    const userSnap = await getDoc(doc(db, "users", session.user.id))
    const linked = userSnap.exists() ? (userSnap.data().linkedProviders ?? {}) : {}

    let detectedProvider = provider
    if (!detectedProvider) {
      const q = query(
        collection(db, "repositories"),
        where("userId", "==", session.user.id),
        where("fullName", "==", fullName)
      )
      const snap = await getDocs(q)
      if (!snap.empty) {
        detectedProvider = (snap.docs[0].data() as { provider?: string }).provider
      }
    }

    if (detectedProvider === "gitlab") {
      const token = linked.gitlab?.accessToken
      const gitlabUsername = linked.gitlab?.username as string | undefined
      const gitlabEmail = linked.gitlab?.email as string | undefined
      if (!token) return NextResponse.json({ error: "No GitLab token" }, { status: 401 })

      let projectId = repoId
      if (!projectId) {
        const searchRes = await fetch(
          `https://gitlab.com/api/v4/projects/${encodeURIComponent(fullName)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!searchRes.ok) return NextResponse.json({ error: "GitLab project not found" }, { status: searchRes.status })
        const proj = await searchRes.json()
        projectId = proj.id
      }

      const metaRes = await fetch(
        `https://gitlab.com/api/v4/projects/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const meta = await metaRes.json()

      const [mrsRes, issuesRes] = await Promise.all([
        fetch(`https://gitlab.com/api/v4/projects/${projectId}/merge_requests?state=all&per_page=100`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`https://gitlab.com/api/v4/projects/${projectId}/issues?state=all&per_page=100`, { headers: { Authorization: `Bearer ${token}` } }),
      ])

      const pullRequests = await mrsRes.json()
      const issues = await issuesRes.json()

      const pullRequestsArr = Array.isArray(pullRequests) ? pullRequests : []
      const issuesArr = Array.isArray(issues) ? issues : []

      const myPullRequests = pullRequestsArr.filter((p: GitlabActor) => p.author?.username === gitlabUsername)
      const myIssuesRaw = issuesArr.filter((i: GitlabActor) => i.author?.username === gitlabUsername)

      const now = new Date()
      const since = new Date()
      since.setDate(now.getDate() - 52 * 7)

      let pageNum = 1
      const allCommitsDates: string[] = []
      const personalCommitsDates: string[] = []
      while (true) {
        const commitsRes = await fetch(
          `https://gitlab.com/api/v4/projects/${projectId}/repository/commits?per_page=100&page=${pageNum}&since=${since.toISOString()}&with_stats=true`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!commitsRes.ok) break
        const batch = await commitsRes.json()
        if (!Array.isArray(batch) || batch.length === 0) break

        batch.forEach((c: { committed_date?: string; created_at?: string; authored_date?: string; author_email?: string }) => {
          const date = c.committed_date || c.created_at || c.authored_date || ""
          allCommitsDates.push(date)
          const isOwnCommit = gitlabEmail ? c.author_email === gitlabEmail : true
          if (isOwnCommit) personalCommitsDates.push(date)
        })

        if (batch.length < 100) break
        pageNum++
      }

      const allCommitsPerWeek = Array(52).fill(0)
      allCommitsDates.forEach(d => {
        const dt = new Date(d)
        const weeksAgo = Math.floor((now.getTime() - dt.getTime()) / (7 * 24 * 60 * 60 * 1000))
        if (weeksAgo >= 0 && weeksAgo < 52) allCommitsPerWeek[51 - weeksAgo] += 1
      })

      const allCommitsArr = allCommitsPerWeek
      if (allCommitsArr.length !== 52) {
        return NextResponse.json({ error: "Insufficient commit data" }, { status: 400 })
      }

      const { mean, std, slope, activeWeeks } = computeCommitStats(allCommitsArr)

      const onlyIssues = issuesArr.filter((i: { pull_request?: unknown }) => !i.pull_request)
      const closedIssues = onlyIssues.filter((i: { state: string }) => i.state === "closed")
      const mergedPRs = pullRequestsArr.filter((p: { merged_at: string | null }) => p.merged_at)
      const repoAgeDays = meta.created_at
        ? Math.floor((Date.now() - new Date(meta.created_at).getTime()) / 86400000)
        : 0

      const features = buildFeatures({
        mean, std, slope, activeWeeks,
        onlyIssues, closedIssues, mergedPRs, pullRequestsArr, repoAgeDays,
        meta: {
          description: meta.description,
          license: meta.license,
          open_issues_count: meta.open_issues_count || 0,
          isPrivate: meta.visibility === "private",
          stars: meta.star_count || 0,
          forks: meta.forks_count || 0,
        },
        avgIssueCloseTime: computeAvgCloseTime(closedIssues),
      })

      const ML_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://127.0.0.1:8000"
      const [prodData, healthData] = await callMLService(ML_URL, features, meta.visibility === "private")
      const adjustedHealthData = adjustHealthForActivity(
        healthData,
        features.commit_frequency > 0,
        features.total_issues > 0
      )

      const personalCommitEvents: DatedCommitCount[] = personalCommitsDates
        .filter(Boolean)
        .map(d => ({ timestampMs: new Date(d).getTime(), count: 1 }))

      const { commitsPerMonth, prPerMonth, issuesPerMonth } = buildMonthlyStats(personalCommitEvents, myPullRequests, myIssuesRaw, now)

      const repoData = {
        userId: session.user.id,
        fullName,
        provider: "gitlab",
        owner,
        name: repo,
        description: meta.description || null,
        language: meta.language || null,
        stars: meta.visibility === "private" ? null : (meta.star_count || 0),
        forks: meta.visibility === "private" ? null : (meta.forks_count || 0),
        isPrivate: meta.visibility === "private",
        productivityState: prodData.label ?? "-",
        commitFrequency: features.commit_frequency,
        activityConsistency: features.activity_consistency,
        commitTrend: features.commit_trend,
        activeDaysRatio: features.active_days_ratio,
        productivityRec: prodData.recommendation ?? null,
        healthScore: adjustedHealthData.healthScore ?? 0,
        healthGrade: adjustedHealthData.grade ?? "-",
        healthLabel: adjustedHealthData.gradeLabel ?? "",
        healthBreakdown: adjustedHealthData.breakdown ?? {},
        healthRecommendations: adjustedHealthData.recommendations ?? [],
        additionsPercent: 50,
        deletionsPercent: 50,
        commitsPerMonth,
        prPerMonth,
        issuesPerMonth,
        analyzedAt: serverTimestamp(),
      }

      await upsertRepo(session.user.id, fullName, repoData)
      return NextResponse.json({ success: true, data: repoData })
    }

    const token = linked.github?.accessToken
    const githubUsername = linked.github?.username as string | undefined
    if (!token) return NextResponse.json({ error: "No GitHub token" }, { status: 401 })

    const headers = {
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    }

    const contributorsResult = await fetchContributorStats(fullName, headers)

    if (contributorsResult.pending) {
      return NextResponse.json({ error: "Stats not ready, retry shortly", pending: true }, { status: 202 })
    }

    const contributorsStats = contributorsResult.stats

    const [metaRes, prsRes, issuesRes, existingRepoSnap] = await Promise.all([
      fetch(`https://api.github.com/repos/${fullName}`, { headers }),
      fetch(`https://api.github.com/repos/${fullName}/pulls?state=all&per_page=100`, { headers }),
      fetch(`https://api.github.com/repos/${fullName}/issues?state=all&per_page=100`, { headers }),
      getDocs(query(collection(db, "repositories"), where("userId", "==", session.user.id), where("fullName", "==", fullName))),
    ])

    const meta = await metaRes.json()
    const pullRequests = await prsRes.json()
    const issues = await issuesRes.json()

    const existingIsPrivate = existingRepoSnap.empty
      ? undefined
      : (existingRepoSnap.docs[0].data().isPrivate as boolean | undefined)
    const resolvedIsPrivate = typeof meta.private === "boolean"
      ? meta.private
      : (existingIsPrivate ?? true)

    const allWeeks = padWeeksTo52(aggregateContributorWeeks(contributorsStats))
    const allCommitsArr: number[] = allWeeks.map(w => w.c)
    if (allCommitsArr.length !== 52) {
      console.error("Insufficient commit data", {
        fullName,
        contributorsFound: contributorsStats.map(c => c.author?.login),
      })
      return NextResponse.json({ error: "Insufficient commit data" }, { status: 400 })
    }

    const myStats = contributorsStats.find(c => c.author?.login === githubUsername)
    const myWeeks = padWeeksTo52(myStats?.weeks ?? [])

    const totalAdditions = myWeeks.reduce((sum, w) => sum + w.a, 0)
    const totalDeletions = myWeeks.reduce((sum, w) => sum + w.d, 0)
    const totalChanges = totalAdditions + totalDeletions
    const additionsPercent = totalChanges > 0 ? Math.round((totalAdditions / totalChanges) * 100) : 50
    const deletionsPercent = totalChanges > 0 ? Math.round((totalDeletions / totalChanges) * 100) : 50

    const { mean, std, slope, activeWeeks } = computeCommitStats(allCommitsArr)

    const pullRequestsArr = Array.isArray(pullRequests) ? pullRequests : []
    const issuesArr = Array.isArray(issues) ? issues : []

    const myPullRequests = pullRequestsArr.filter((p: GithubPR) => p.user?.login === githubUsername)
    const myIssuesRaw = issuesArr.filter((i: GithubIssue) => i.user?.login === githubUsername)

    const onlyIssues = issuesArr.filter((i: GithubIssue) => !i.pull_request)
    const closedIssues = onlyIssues.filter((i: GithubIssue) => i.state === "closed")
    const mergedPRs = pullRequestsArr.filter((p: GithubPR) => p.merged_at)
    const repoAgeDays = meta.created_at
      ? Math.floor((Date.now() - new Date(meta.created_at).getTime()) / 86400000)
      : 0

    const features = buildFeatures({
      mean, std, slope, activeWeeks,
      onlyIssues, closedIssues, mergedPRs,
      pullRequestsArr,
      repoAgeDays,
      meta: {
        description: meta.description,
        license: meta.license,
        open_issues_count: meta.open_issues_count || 0,
        isPrivate: resolvedIsPrivate,
        stars: meta.stargazers_count || 0,
        forks: meta.forks_count || 0,
      },
      avgIssueCloseTime: computeAvgCloseTime(closedIssues),
    })

    const ML_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://127.0.0.1:8000"
    const [prodData, healthData] = await callMLService(ML_URL, features, resolvedIsPrivate)
    const adjustedHealthData = adjustHealthForActivity(
      healthData,
      features.commit_frequency > 0,
      features.total_issues > 0
    )

    const now = new Date()
    const personalCommitEvents: DatedCommitCount[] = myWeeks.map(w => ({ timestampMs: w.w * 1000, count: w.c }))
    const { commitsPerMonth, prPerMonth, issuesPerMonth } = buildMonthlyStats(
      personalCommitEvents,
      myPullRequests,
      myIssuesRaw,
      now
    )

    const repoData = {
      userId: session.user.id,
      fullName,
      provider: "github",
      owner,
      name: repo,
      description: meta.description || null,
      language: meta.language || null,
      stars: resolvedIsPrivate ? null : (meta.stargazers_count || 0),
      forks: resolvedIsPrivate ? null : (meta.forks_count || 0),
      isPrivate: resolvedIsPrivate,
      productivityState: prodData.label ?? "-",
      commitFrequency: features.commit_frequency,
      activityConsistency: features.activity_consistency,
      commitTrend: features.commit_trend,
      activeDaysRatio: features.active_days_ratio,
      productivityRec: prodData.recommendation ?? null,
      healthScore: adjustedHealthData.healthScore ?? 0,
      healthGrade: adjustedHealthData.grade ?? "-",
      healthLabel: adjustedHealthData.gradeLabel ?? "",
      healthBreakdown: adjustedHealthData.breakdown ?? {},
      healthRecommendations: adjustedHealthData.recommendations ?? [],
      additionsPercent,
      deletionsPercent,
      commitsPerMonth,
      prPerMonth,
      issuesPerMonth,
      analyzedAt: serverTimestamp(),
    }

    await upsertRepo(session.user.id, fullName, repoData)
    return NextResponse.json({ success: true, data: repoData })

  } catch (e) {
    console.error("Analyze error:", e)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
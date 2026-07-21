import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs, doc, serverTimestamp, getDoc } from "firebase/firestore"
import { getValidGitLabToken } from "@/shared/lib/gitlab"
import {
  GithubIssue, GithubPR, DatedCommitCount,
  computeCommitStats, computeAvgCloseTime, buildFeatures, callMLService, buildMonthlyStats, upsertRepo,
  fetchContributorStats, padWeeksTo52, aggregateContributorWeeks, adjustHealthForActivity,
  fetchRepoCommitsRaw, bucketCommitsInto52Weeks,
} from "@/shared/lib/analyzeUtils"

interface GitlabActor {
  author?: { username?: string }
}

async function getTeamSpaceOwnerId(teamSpaceId: string): Promise<string | null> {
  const tsSnap = await getDoc(doc(db, "teamSpaces", teamSpaceId))
  if (!tsSnap.exists()) return null
  return (tsSnap.data().ownerId as string) ?? null
}

async function getOwnerLinkedProviders(ownerId: string) {
  const ownerSnap = await getDoc(doc(db, "users", ownerId))
  return ownerSnap.exists() ? (ownerSnap.data().linkedProviders ?? {}) : {}
}

async function resolveGithubAccess(
  fullName: string,
  ownToken: string | null,
  teamSpaceId: string | null
): Promise<{ token: string; isOwnerToken: boolean; metaRes: Response } | null> {
  if (ownToken) {
    const metaRes = await fetch(`https://api.github.com/repos/${fullName}`, {
      headers: { Authorization: `Bearer ${ownToken}`, "X-GitHub-Api-Version": "2022-11-28" }
    })
    if (metaRes.ok) return { token: ownToken, isOwnerToken: false, metaRes }
  }

  if (teamSpaceId) {
    const ownerId = await getTeamSpaceOwnerId(teamSpaceId)
    if (ownerId) {
      const ownerLinked = await getOwnerLinkedProviders(ownerId)
      const ownerToken  = ownerLinked.github?.accessToken as string | undefined
      if (ownerToken) {
        const metaRes = await fetch(`https://api.github.com/repos/${fullName}`, {
          headers: { Authorization: `Bearer ${ownerToken}`, "X-GitHub-Api-Version": "2022-11-28" }
        })
        if (metaRes.ok) return { token: ownerToken, isOwnerToken: true, metaRes }
      }
    }
  }

  return null
}

async function resolveGitlabAccess(
  fullName: string,
  ownToken: string | null,
  teamSpaceId: string | null
): Promise<{ token: string; isOwnerToken: boolean; projectId: number } | null> {
  const tryToken = async (token: string) => {
    const res = await fetch(
      `https://gitlab.com/api/v4/projects/${encodeURIComponent(fullName)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) return null
    const proj = await res.json()
    return proj.id as number
  }

  if (ownToken) {
    const projectId = await tryToken(ownToken)
    if (projectId) return { token: ownToken, isOwnerToken: false, projectId }
  }

  if (teamSpaceId) {
    const ownerId = await getTeamSpaceOwnerId(teamSpaceId)
    if (ownerId) {
      const ownerLinked = await getOwnerLinkedProviders(ownerId)
      if (ownerLinked.gitlab?.accessToken) {
        const ownerToken = await getValidGitLabToken(ownerId)
        if (ownerToken) {
          const projectId = await tryToken(ownerToken)
          if (projectId) return { token: ownerToken, isOwnerToken: true, projectId }
        }
      }
    }
  }

  return null
}

function resolveIsPersonalRepo(
  teamSpaceId: string | null,
  isOwnerToken: boolean,
  isRepoOwner: boolean,
  hasOwnActivity: boolean
): boolean {
  if (!teamSpaceId) return true
  return !isOwnerToken && (isRepoOwner || hasOwnActivity)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { fullName, provider, teamSpaceId } = await req.json()
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
      const ownToken = (linked.gitlab?.accessToken as string | undefined)
        ? await getValidGitLabToken(session.user.id)
        : null
      const gitlabUsername = linked.gitlab?.username as string | undefined
      const gitlabEmail = linked.gitlab?.email as string | undefined

      const access = await resolveGitlabAccess(fullName, ownToken, teamSpaceId ?? null)
      if (!access) return NextResponse.json({ error: "No access to repository" }, { status: 403 })
      const { token, isOwnerToken, projectId } = access

      const metaRes = await fetch(
        `https://gitlab.com/api/v4/projects/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!metaRes.ok) return NextResponse.json({ error: "No access to repository" }, { status: metaRes.status })
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

      const isProjectOwner = (meta.namespace?.path as string | undefined)?.toLowerCase() === gitlabUsername?.toLowerCase()
      const hasOwnCommits = personalCommitEvents.length > 0
      const isPersonalRepo = resolveIsPersonalRepo(teamSpaceId ?? null, isOwnerToken, isProjectOwner, hasOwnCommits)

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
        isPersonalRepo,
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

    const githubUsername = linked.github?.username as string | undefined
    const ownToken = (linked.github?.accessToken as string | undefined) ?? null

    const access = await resolveGithubAccess(fullName, ownToken, teamSpaceId ?? null)
    if (!access) return NextResponse.json({ error: "No access to repository" }, { status: 403 })
    const { token, isOwnerToken, metaRes } = access

    const headers = {
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    }

    const contributorsResult = await fetchContributorStats(fullName, headers)

    if (contributorsResult.pending) {
      return NextResponse.json({ error: "Stats not ready, retry shortly", pending: true }, { status: 202 })
    }

    const contributorsStats = contributorsResult.stats

    const [prsRes, issuesRes, existingRepoSnap] = await Promise.all([
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

    let allCommitsArr: number[]
    let personalCommitEvents: DatedCommitCount[]
    let additionsPercent = 50
    let deletionsPercent = 50

    if (contributorsStats.length > 0) {
      const allWeeks = padWeeksTo52(aggregateContributorWeeks(contributorsStats))
      allCommitsArr = allWeeks.map(w => w.c)

      const myStats = contributorsStats.find(c => c.author?.login?.toLowerCase() === githubUsername?.toLowerCase())
      const myWeeks = padWeeksTo52(myStats?.weeks ?? [])

      const totalAdditions = myWeeks.reduce((sum, w) => sum + w.a, 0)
      const totalDeletions = myWeeks.reduce((sum, w) => sum + w.d, 0)
      const totalChanges = totalAdditions + totalDeletions
      additionsPercent = totalChanges > 0 ? Math.round((totalAdditions / totalChanges) * 100) : 50
      deletionsPercent = totalChanges > 0 ? Math.round((totalDeletions / totalChanges) * 100) : 50

      personalCommitEvents = myWeeks.map(w => ({ timestampMs: w.w * 1000, count: w.c }))
    } else {
      console.error("Contributor stats unavailable, falling back to raw commits", { fullName })

      const sinceDate = new Date()
      sinceDate.setDate(sinceDate.getDate() - 52 * 7)
      const rawCommits = await fetchRepoCommitsRaw(fullName, headers, sinceDate.toISOString())

      allCommitsArr = bucketCommitsInto52Weeks(rawCommits.map(c => c.date))

      const myLogin = githubUsername?.toLowerCase()
      const myRawCommits = rawCommits.filter(c => c.login === myLogin)
      personalCommitEvents = myRawCommits
        .filter(c => c.date)
        .map(c => ({ timestampMs: new Date(c.date).getTime(), count: 1 }))
    }

    if (allCommitsArr.length !== 52) {
      console.error("Insufficient commit data", {
        fullName,
        contributorsFound: contributorsStats.map(c => c.author?.login),
      })
      return NextResponse.json({ error: "Insufficient commit data" }, { status: 400 })
    }

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
    const { commitsPerMonth, prPerMonth, issuesPerMonth } = buildMonthlyStats(
      personalCommitEvents,
      myPullRequests,
      myIssuesRaw,
      now
    )

    const isRepoOwner = (meta.owner?.login as string | undefined)?.toLowerCase() === githubUsername?.toLowerCase()
    const hasOwnCommits = personalCommitEvents.some(e => e.count > 0)
    const isPersonalRepo = resolveIsPersonalRepo(teamSpaceId ?? null, isOwnerToken, isRepoOwner, hasOwnCommits)

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
      isPersonalRepo,
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
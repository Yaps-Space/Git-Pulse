import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, getDoc } from "firebase/firestore"

interface GithubIssue {
  pull_request?: unknown
  state:         string
  created_at:    string
  closed_at:     string
}

interface GithubPR {
  merged_at:  string | null
  created_at: string
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
    const linked   = userSnap.exists() ? (userSnap.data().linkedProviders ?? {}) : {}

    let detectedProvider = provider
    if (!detectedProvider) {
      const q    = query(
        collection(db, "repositories"),
        where("userId",   "==", session.user.id),
        where("fullName", "==", fullName)
      )
      const snap = await getDocs(q)
      if (!snap.empty) {
        detectedProvider = (snap.docs[0].data() as { provider?: string }).provider
      }
    }

    // ── GITLAB BRANCH ─────────────────────────────────────────
    if (detectedProvider === "gitlab") {
      const token = linked.gitlab?.accessToken
      if (!token) return NextResponse.json({ error: "No GitLab token" }, { status: 401 })

      let projectId = repoId
      if (!projectId) {
        const searchRes = await fetch(
          `https://gitlab.com/api/v4/projects/${encodeURIComponent(fullName)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!searchRes.ok) return NextResponse.json({ error: "GitLab project not found" }, { status: searchRes.status })
        const proj = await searchRes.json()
        projectId  = proj.id
      }

      const metaRes = await fetch(
        `https://gitlab.com/api/v4/projects/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const meta = await metaRes.json()

      const [mrsRes, issuesRes] = await Promise.all([
        fetch(`https://gitlab.com/api/v4/projects/${projectId}/merge_requests?state=all&per_page=100`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`https://gitlab.com/api/v4/projects/${projectId}/issues?state=all&per_page=100`,         { headers: { Authorization: `Bearer ${token}` } }),
      ])

      const pullRequests = await mrsRes.json()
      const issues       = await issuesRes.json()

      const now   = new Date()
      const since = new Date()
      since.setDate(now.getDate() - 52 * 7)

      let pageNum      = 1
      const commitsDates: string[] = []
      while (true) {
        const commitsRes = await fetch(
          `https://gitlab.com/api/v4/projects/${projectId}/repository/commits?per_page=100&page=${pageNum}&since=${since.toISOString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!commitsRes.ok) break
        const batch = await commitsRes.json()
        if (!Array.isArray(batch) || batch.length === 0) break
        batch.forEach((c: { committed_date?: string; created_at?: string; authored_date?: string }) =>
          commitsDates.push(c.committed_date || c.created_at || c.authored_date || "")
        )
        if (batch.length < 100) break
        pageNum++
      }

      const commitsPerWeek = Array(52).fill(0)
      commitsDates.forEach(d => {
        const dt       = new Date(d)
        const weeksAgo = Math.floor((now.getTime() - dt.getTime()) / (7 * 24 * 60 * 60 * 1000))
        if (weeksAgo >= 0 && weeksAgo < 52) commitsPerWeek[51 - weeksAgo] += 1
      })

      const commitsArr     = commitsPerWeek
      const pullRequestsArr = Array.isArray(pullRequests) ? pullRequests : []
      const issuesArr       = Array.isArray(issues)       ? issues       : []

      if (commitsArr.length !== 52) {
        return NextResponse.json({ error: "Insufficient commit data" }, { status: 400 })
      }

      const { mean, std, slope, activeWeeks } = computeCommitStats(commitsArr)

      const onlyIssues   = issuesArr.filter((i: { pull_request?: unknown }) => !i.pull_request)
      const closedIssues = onlyIssues.filter((i: { state: string }) => i.state === "closed")
      const mergedPRs    = pullRequestsArr.filter((p: { merged_at: string | null }) => p.merged_at)
      const repoAgeDays  = meta.created_at
        ? Math.floor((Date.now() - new Date(meta.created_at).getTime()) / 86400000)
        : 0

      const features = buildFeatures({
        mean, std, slope, activeWeeks,
        onlyIssues, closedIssues, mergedPRs, pullRequestsArr, repoAgeDays,
        meta: {
          description:      meta.description,
          license:          meta.license,
          open_issues_count: meta.open_issues_count || 0,
          isPrivate:        meta.visibility === "private",
          stars:            meta.star_count  || 0,
          forks:            meta.forks_count || 0,
        },
        avgIssueCloseTime: computeAvgCloseTime(closedIssues),
      })

      const ML_URL           = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://127.0.0.1:8000"
      const [prodData, healthData] = await callMLService(ML_URL, features, meta.visibility === "private")

      const { commitsPerMonth, prPerMonth, issuesPerMonth } = buildMonthlyStats(commitsArr, pullRequestsArr, issuesArr, now)

      const repoData = {
        userId:                session.user.id,
        fullName,
        provider:              "gitlab",
        owner,
        name:                  repo,
        description:           meta.description   || null,
        language:              meta.language       || null,
        stars:                 meta.visibility === "private" ? null : (meta.star_count  || 0),
        forks:                 meta.visibility === "private" ? null : (meta.forks_count || 0),
        isPrivate:             meta.visibility === "private",
        productivityState:     prodData.label         ?? "-",
        commitFrequency:       features.commit_frequency,
        activityConsistency:   features.activity_consistency,
        commitTrend:           features.commit_trend,
        activeDaysRatio:       features.active_days_ratio,
        productivityRec:       prodData.recommendation ?? null,
        healthScore:           healthData.healthScore  ?? 0,
        healthGrade:           healthData.grade        ?? "-",
        healthLabel:           healthData.gradeLabel   ?? "",
        healthBreakdown:       healthData.breakdown    ?? {},
        healthRecommendations: healthData.recommendations ?? [],
        additionsPercent:      50,
        deletionsPercent:      50,
        commitsPerMonth,
        prPerMonth,
        issuesPerMonth,
        analyzedAt:            serverTimestamp(),
      }

      await upsertRepo(session.user.id, fullName, repoData)
      return NextResponse.json({ success: true, data: repoData })
    }

    // ── GITHUB BRANCH ─────────────────────────────────────────
    const token = linked.github?.accessToken
    if (!token) return NextResponse.json({ error: "No GitHub token" }, { status: 401 })

    const headers = {
      Authorization:        `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    }

    const [participationRes, metaRes, commitsRes, prsRes, issuesRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${fullName}/stats/participation`,           { headers }),
      fetch(`https://api.github.com/repos/${fullName}`,                               { headers }),
      fetch(`https://api.github.com/repos/${fullName}/stats/code_frequency`,          { headers }),
      fetch(`https://api.github.com/repos/${fullName}/pulls?state=all&per_page=100`,  { headers }),
      fetch(`https://api.github.com/repos/${fullName}/issues?state=all&per_page=100`, { headers }),
    ])

    const participation = await participationRes.json()
    const meta          = await metaRes.json()
    const codeFrequency = await commitsRes.json()
    const pullRequests  = await prsRes.json()
    const issues        = await issuesRes.json()

    const commitsArr: number[] = participation.all || []
    if (commitsArr.length !== 52) {
      return NextResponse.json({ error: "Insufficient commit data" }, { status: 400 })
    }

    const { mean, std, slope, activeWeeks } = computeCommitStats(commitsArr)

    const onlyIssues   = Array.isArray(issues)       ? issues.filter((i: GithubIssue) => !i.pull_request)  : []
    const closedIssues = onlyIssues.filter((i: GithubIssue) => i.state === "closed")
    const mergedPRs    = Array.isArray(pullRequests) ? pullRequests.filter((p: GithubPR) => p.merged_at)    : []
    const repoAgeDays  = meta.created_at
      ? Math.floor((Date.now() - new Date(meta.created_at).getTime()) / 86400000)
      : 0

    const features = buildFeatures({
      mean, std, slope, activeWeeks,
      onlyIssues, closedIssues, mergedPRs,
      pullRequestsArr: Array.isArray(pullRequests) ? pullRequests : [],
      repoAgeDays,
      meta: {
        description:       meta.description,
        license:           meta.license,
        open_issues_count: meta.open_issues_count || 0,
        isPrivate:         meta.private || false,
        stars:             meta.stargazers_count  || 0,
        forks:             meta.forks_count       || 0,
      },
      avgIssueCloseTime: computeAvgCloseTime(closedIssues),
    })

    const ML_URL           = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://127.0.0.1:8000"
    const [prodData, healthData] = await callMLService(ML_URL, features, meta.private || false)

    let totalAdditions = 0
    let totalDeletions = 0
    if (Array.isArray(codeFrequency)) {
      codeFrequency.forEach((week: number[]) => {
        totalAdditions += week[1] ?? 0
        totalDeletions += Math.abs(week[2] ?? 0)
      })
    }
    const totalChanges     = totalAdditions + totalDeletions
    const additionsPercent = totalChanges > 0 ? Math.round((totalAdditions / totalChanges) * 100) : 50
    const deletionsPercent = totalChanges > 0 ? Math.round((totalDeletions / totalChanges) * 100) : 50

    const now = new Date()
    const { commitsPerMonth, prPerMonth, issuesPerMonth } = buildMonthlyStats(
      commitsArr,
      Array.isArray(pullRequests) ? pullRequests : [],
      Array.isArray(issues)       ? issues       : [],
      now
    )

    const repoData = {
      userId:                session.user.id,
      fullName,
      provider:              "github",
      owner,
      name:                  repo,
      description:           meta.description      || null,
      language:              meta.language         || null,
      stars:                 meta.private ? null : (meta.stargazers_count || 0),
      forks:                 meta.private ? null : (meta.forks_count      || 0),
      isPrivate:             meta.private           || false,
      productivityState:     prodData.label         ?? "-",
      commitFrequency:       features.commit_frequency,
      activityConsistency:   features.activity_consistency,
      commitTrend:           features.commit_trend,
      activeDaysRatio:       features.active_days_ratio,
      productivityRec:       prodData.recommendation ?? null,
      healthScore:           healthData.healthScore  ?? 0,
      healthGrade:           healthData.grade        ?? "-",
      healthLabel:           healthData.gradeLabel   ?? "",
      healthBreakdown:       healthData.breakdown    ?? {},
      healthRecommendations: healthData.recommendations ?? [],
      additionsPercent,
      deletionsPercent,
      commitsPerMonth,
      prPerMonth,
      issuesPerMonth,
      analyzedAt:            serverTimestamp(),
    }

    await upsertRepo(session.user.id, fullName, repoData)
    return NextResponse.json({ success: true, data: repoData })

  } catch (e) {
    console.error("Analyze error:", e)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}

// ── Helpers ───────────────────────────────────────────────────

function computeCommitStats(commits: number[]) {
  const mean       = commits.reduce((a, b) => a + b, 0) / 52
  const std        = Math.sqrt(commits.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 52)
  const n          = 52
  const sumX       = n * (n - 1) / 2
  const sumY       = commits.reduce((a, b) => a + b, 0)
  const sumXY      = commits.reduce((a, b, i) => a + i * b, 0)
  const sumX2      = commits.reduce((a, _b, i) => a + i * i, 0)
  const slope      = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const activeWeeks = commits.filter(c => c > 0).length
  return { mean, std, slope, activeWeeks }
}

function computeAvgCloseTime(closedIssues: { created_at: string; closed_at: string }[]) {
  if (closedIssues.length === 0) return 0
  return closedIssues.reduce((sum, i) => {
    return sum + (new Date(i.closed_at).getTime() - new Date(i.created_at).getTime()) / 3600000
  }, 0) / closedIssues.length
}

function buildFeatures({
  mean, std, slope, activeWeeks,
  onlyIssues, closedIssues, mergedPRs, pullRequestsArr, repoAgeDays,
  meta, avgIssueCloseTime,
}: {
  mean: number; std: number; slope: number; activeWeeks: number
  onlyIssues: unknown[]; closedIssues: unknown[]; mergedPRs: unknown[]
  pullRequestsArr: unknown[]; repoAgeDays: number
  meta: { description?: string | null; license?: unknown; open_issues_count: number; isPrivate: boolean; stars: number; forks: number }
  avgIssueCloseTime: number
}) {
  return {
    commit_frequency:     parseFloat(mean.toFixed(4)),
    activity_consistency: parseFloat(std.toFixed(4)),
    commit_trend:         parseFloat(slope.toFixed(6)),
    active_days_ratio:    parseFloat((activeWeeks / 52).toFixed(4)),
    issue_close_ratio:    parseFloat((closedIssues.length / Math.max(onlyIssues.length, 1)).toFixed(4)),
    total_issues:         onlyIssues.length,
    pr_merge_ratio:       parseFloat((mergedPRs.length / Math.max(pullRequestsArr.length, 1)).toFixed(4)),
    merged_pr_count:      mergedPRs.length,
    repo_age_days:        repoAgeDays,
    velocity_stability:   parseFloat((std / (mean + 1e-9)).toFixed(4)),
    has_description:      meta.description ? 1 : 0,
    has_license:          meta.license     ? 1 : 0,
    has_readme:           1,
    has_contributing:     0,
    has_coc:              0,
    open_issues_count:    meta.open_issues_count,
    stars:                meta.isPrivate ? null : meta.stars,
    forks_count:          meta.isPrivate ? null : meta.forks,
    avg_issue_close_time: avgIssueCloseTime,
  }
}

async function callMLService(ML_URL: string, features: ReturnType<typeof buildFeatures>, isPrivate: boolean) {
  const [prodRes, healthRes] = await Promise.all([
    fetch(`${ML_URL}/predict/productivity`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        commit_frequency:     features.commit_frequency,
        activity_consistency: features.activity_consistency,
        commit_trend:         features.commit_trend,
        active_days_ratio:    features.active_days_ratio,
        issue_close_ratio:    features.issue_close_ratio,
        total_issues:         features.total_issues,
        pr_merge_ratio:       features.pr_merge_ratio,
        merged_pr_count:      features.merged_pr_count,
        repo_age_days:        features.repo_age_days,
      }),
    }),
    fetch(`${ML_URL}/predict/health`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        is_private:           isPrivate,
        velocity_stability:   features.velocity_stability,
        has_readme:           features.has_readme,
        has_contributing:     features.has_contributing,
        has_coc:              features.has_coc,
        has_license:          features.has_license,
        has_description:      features.has_description,
        stars:                features.stars,
        forks_count:          features.forks_count,
        open_issues_count:    features.open_issues_count,
        avg_issue_close_time: features.avg_issue_close_time,
      }),
    }),
  ])
  return [await prodRes.json(), await healthRes.json()]
}

function buildMonthlyStats(
  commitsArr: number[],
  pullRequestsArr: { created_at: string }[],
  issuesArr:       { pull_request?: unknown; created_at: string }[],
  now: Date
) {
  const commitsPerMonth = Array(12).fill(0)
  commitsArr.forEach((weekCount, weekIdx) => {
    const monthIdx = 11 - Math.floor((51 - weekIdx) / 4.33)
    if (monthIdx >= 0 && monthIdx < 12) commitsPerMonth[monthIdx] += weekCount
  })

  const prPerMonth = Array(12).fill(0)
  pullRequestsArr.forEach(pr => {
    const monthIdx = 11 - Math.floor((now.getTime() - new Date(pr.created_at).getTime()) / (30.44 * 86400000))
    if (monthIdx >= 0 && monthIdx < 12) prPerMonth[monthIdx]++
  })

  const issuesPerMonth = Array(12).fill(0)
  issuesArr
    .filter(i => !i.pull_request)
    .forEach(issue => {
      const monthIdx = 11 - Math.floor((now.getTime() - new Date(issue.created_at).getTime()) / (30.44 * 86400000))
      if (monthIdx >= 0 && monthIdx < 12) issuesPerMonth[monthIdx]++
    })

  return { commitsPerMonth, prPerMonth, issuesPerMonth }
}

async function upsertRepo(userId: string, fullName: string, repoData: object) {
  const q    = query(
    collection(db, "repositories"),
    where("userId",   "==", userId),
    where("fullName", "==", fullName)
  )
  const snap = await getDocs(q)
  if (snap.empty) {
    await addDoc(collection(db, "repositories"), repoData)
  } else {
    await updateDoc(doc(db, "repositories", snap.docs[0].id), repoData)
  }
}
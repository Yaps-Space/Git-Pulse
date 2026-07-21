import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore"
import { getProviderTokens } from "@/shared/lib/getProviderTokens"
import { getValidGitLabToken } from "@/shared/lib/gitlab"
import { GithubCommit, MembershipDoc, MlPredictResponse } from "@/features/team-space/detail/types/analyzeTypes"

function getLastNMonths(n: number): { year: number; month: number }[] {
  const now    = new Date()
  const result = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({ year: d.getFullYear(), month: d.getMonth() })
  }
  return result
}

async function getTokensForRepo(teamSpaceOwnerId: string, fallbackUserId: string) {
  const targetUserId = teamSpaceOwnerId || fallbackUserId
  const base        = await getProviderTokens(targetUserId)
  const gitlabToken = base.gitlabToken ? await getValidGitLabToken(targetUserId) : null

  if (base.githubToken || gitlabToken) {
    return { githubToken: base.githubToken, gitlabToken }
  }
  return getProviderTokens(fallbackUserId)
}

async function fetchRepoCommits(
  repoFullName: string,
  sinceStr:     string,
  githubToken:  string | null,
  gitlabToken:  string | null,
): Promise<{ login: string; date: string }[]> {
  if (githubToken) {
    const commits: { login: string; date: string }[] = []
    let page = 1
    while (true) {
      const res  = await fetch(
        `https://api.github.com/repos/${repoFullName}/commits?per_page=100&page=${page}&since=${sinceStr}`,
        { headers: { Authorization: `Bearer ${githubToken}` } }
      )
      if (!res.ok) break
      const data = await res.json() as GithubCommit[]
      if (!Array.isArray(data) || data.length === 0) break
      data.forEach(c => {
        const login = c.author?.login?.toLowerCase()
          || c.commit?.author?.email?.toLowerCase()
          || c.commit?.author?.name?.toLowerCase()
        if (login) commits.push({ login, date: c.commit?.author?.date || "" })
      })
      if (data.length < 100) break
      page++
    }
    return commits
  }

  if (gitlabToken) {
    const encodedRepo = encodeURIComponent(repoFullName)
    const commits: { login: string; date: string }[] = []
    let page = 1
    while (true) {
      const res  = await fetch(
        `https://gitlab.com/api/v4/projects/${encodedRepo}/repository/commits?per_page=100&page=${page}&since=${sinceStr}`,
        { headers: { Authorization: `Bearer ${gitlabToken}` } }
      )
      if (!res.ok) break
      const data = await res.json() as { author_email: string; author_name: string; authored_date: string }[]
      if (!Array.isArray(data) || data.length === 0) break
      data.forEach(c => {
        const login = c.author_email?.toLowerCase() || c.author_name?.toLowerCase()
        if (login) commits.push({ login, date: c.authored_date || "" })
      })
      if (data.length < 100) break
      page++
    }
    return commits
  }

  return []
}

async function callMLPredictor(memberCommitCount: number, contributionShare: number, activeWeeks: number, activeRatio: number): Promise<MlPredictResponse> {
  const ML_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://127.0.0.1:8000"
  const mlRes  = await fetch(`${ML_URL}/predict/contributor`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      commit_count:     memberCommitCount,
      contribution_pct: contributionShare * 100,
      active_weeks:     activeWeeks,
      active_ratio:     activeRatio,
    }),
  })
  return mlRes.json() as Promise<MlPredictResponse>
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: classId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const tsSnap = await getDoc(doc(db, "teamSpaces", classId))
    if (!tsSnap.exists()) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const ts = tsSnap.data()

    const memberSnap = await getDocs(
      query(collection(db, "memberships"), where("classId", "==", classId))
    )
    const members = memberSnap.docs.map(d => ({ membershipId: d.id, ...d.data() })) as MembershipDoc[]

    await Promise.all(
      members.map(m => updateDoc(doc(db, "memberships", m.membershipId), { memberStatus: "analyzing" }))
    )

    const repoFullNames: string[] = Array.isArray(ts.repoFullNames)
      ? ts.repoFullNames
      : ts.repoFullName ? [ts.repoFullName as string] : []

    const since    = new Date()
    since.setFullYear(since.getFullYear() - 1)
    const sinceStr = since.toISOString()

    const last12Months = getLastNMonths(12)

    const memberStatsByRepo: Record<string, Record<string, { commits: number; dates: string[] }>> = {}
    const repoCommitCounts: Record<string, number> = {}

    for (const repoFullName of repoFullNames) {
      const { githubToken, gitlabToken } = await getTokensForRepo(ts.ownerId as string, session.user.id)
      const commits = await fetchRepoCommits(repoFullName, sinceStr, githubToken, gitlabToken)
      repoCommitCounts[repoFullName] = commits.length

      memberStatsByRepo[repoFullName] = {}
      commits.forEach(({ login, date }) => {
        if (!memberStatsByRepo[repoFullName][login]) {
          memberStatsByRepo[repoFullName][login] = { commits: 0, dates: [] }
        }
        memberStatsByRepo[repoFullName][login].commits++
        memberStatsByRepo[repoFullName][login].dates.push(date)
      })
    }

    for (const member of members) {
      const loginKey = (member.userLogin ?? member.userName)?.toLowerCase()

      const commitsPerMonthByRepo: Record<string, number[]> = {}
      const commitVelocityByRepo: Record<string, number> = {}
      const contributionShareByRepo: Record<string, number> = {}
      const activityConsistencyByRepo: Record<string, number> = {}
      const activeWeeksRatioByRepo: Record<string, number> = {}
      const statusByRepo: Record<string, string> = {}
      const recommendationByRepo: Record<string, string> = {}

      const allDatesAllRepos: string[] = []

      for (const repoFullName of repoFullNames) {
        const stats = memberStatsByRepo[repoFullName]?.[loginKey] || { commits: 0, dates: [] }
        const memberCommitCount = stats.commits
        const repoTotalCommits = repoCommitCounts[repoFullName]
        const contributionShare = repoTotalCommits > 0 ? memberCommitCount / repoTotalCommits : 0

        const weeks = new Set(stats.dates.map((d: string) => {
          const date        = new Date(d)
          const startOfYear = new Date(date.getFullYear(), 0, 1)
          return Math.floor((date.getTime() - startOfYear.getTime()) / (7 * 86400000))
        }))
        const activeWeeksRatio    = Math.min(weeks.size / 52, 1)
        const activityConsistency = memberCommitCount > 0 ? weeks.size / 52 : 0
        const commitVelocity      = memberCommitCount / 52

        commitVelocityByRepo[repoFullName] = commitVelocity
        contributionShareByRepo[repoFullName] = contributionShare
        activityConsistencyByRepo[repoFullName] = activityConsistency
        activeWeeksRatioByRepo[repoFullName] = activeWeeksRatio

        commitsPerMonthByRepo[repoFullName] = last12Months.map(({ year, month }) =>
          stats.dates.filter((d: string) => {
            const date = new Date(d)
            return date.getFullYear() === year && date.getMonth() === month
          }).length
        )

        const mlData = await callMLPredictor(memberCommitCount, contributionShare, weeks.size, activeWeeksRatio)
        statusByRepo[repoFullName] = mlData.status
        recommendationByRepo[repoFullName] = mlData.recommendation

        allDatesAllRepos.push(...stats.dates)
      }

      const memberCommitCountAll = allDatesAllRepos.length
      const contributionShareAll = Object.values(repoCommitCounts).reduce((a, b) => a + b, 0) > 0
        ? memberCommitCountAll / Object.values(repoCommitCounts).reduce((a, b) => a + b, 0)
        : 0

      const weeksAll = new Set(allDatesAllRepos.map((d: string) => {
        const date        = new Date(d)
        const startOfYear = new Date(date.getFullYear(), 0, 1)
        return Math.floor((date.getTime() - startOfYear.getTime()) / (7 * 86400000))
      }))
      const activeWeeksRatioAll    = Math.min(weeksAll.size / 52, 1)
      const activityConsistencyAll = memberCommitCountAll > 0 ? weeksAll.size / 52 : 0
      const commitVelocityAll      = memberCommitCountAll / 52

      const commitsPerMonth = last12Months.map(({ year, month }) =>
        allDatesAllRepos.filter((d: string) => {
          const date = new Date(d)
          return date.getFullYear() === year && date.getMonth() === month
        }).length
      )

      const mlData = await callMLPredictor(memberCommitCountAll, contributionShareAll, weeksAll.size, activeWeeksRatioAll)

      await updateDoc(doc(db, "memberships", member.membershipId), {
        memberStatus:              mlData.status,
        commitVelocity:            commitVelocityAll,
        contributionShare:         contributionShareAll,
        activityConsistency:       activityConsistencyAll,
        activeWeeksRatio:          activeWeeksRatioAll,
        commitsPerMonth,
        commitsPerMonthByRepo,
        commitVelocityByRepo,
        contributionShareByRepo,
        activityConsistencyByRepo,
        activeWeeksRatioByRepo,
        statusByRepo,
        recommendationByRepo,
        recommendation:            mlData.recommendation,
        analyzedAt:                new Date(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Analyze error:", e)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
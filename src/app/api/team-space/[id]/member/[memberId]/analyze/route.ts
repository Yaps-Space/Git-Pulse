import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { getProviderTokens } from "@/shared/lib/getProviderTokens"
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

async function fetchMemberCommitDates(
  repoFullName: string,
  loginKey:     string,
  sinceStr:     string,
  githubToken:  string | null,
  gitlabToken:  string | null,
): Promise<string[]> {
  const dates: string[] = []

  if (githubToken) {
    let page = 1
    while (true) {
      const res  = await fetch(
        `https://api.github.com/repos/${repoFullName}/commits?per_page=100&page=${page}&since=${sinceStr}&sha=main`,
        { headers: { Authorization: `Bearer ${githubToken}` } }
      )
      const data = await res.json() as GithubCommit[]
      if (!Array.isArray(data) || data.length === 0) break
      data.forEach(c => {
        const login =
          c.author?.login?.toLowerCase() ||
          c.commit?.author?.email?.toLowerCase() ||
          c.commit?.author?.name?.toLowerCase()
        if (login === loginKey) dates.push(c.commit?.author?.date || "")
      })
      if (data.length < 100) break
      page++
    }
    return dates
  }

  if (gitlabToken) {
    const encodedRepo = encodeURIComponent(repoFullName)
    let page = 1
    while (true) {
      const res  = await fetch(
        `https://gitlab.com/api/v4/projects/${encodedRepo}/repository/commits?per_page=100&page=${page}&since=${sinceStr}&ref_name=main`,
        { headers: { Authorization: `Bearer ${gitlabToken}` } }
      )
      const data = await res.json() as { author_email: string; author_name: string; authored_date: string }[]
      if (!Array.isArray(data) || data.length === 0) break
      data.forEach(c => {
        const login = c.author_email?.toLowerCase() || c.author_name?.toLowerCase()
        if (login === loginKey) dates.push(c.authored_date || "")
      })
      if (data.length < 100) break
      page++
    }
    return dates
  }

  return dates
}

async function fetchRepoTotalCommits(
  repoFullName: string,
  sinceStr:     string,
  githubToken:  string | null,
  gitlabToken:  string | null,
): Promise<number> {
  let total = 0

  if (githubToken) {
    let page = 1
    while (true) {
      const res  = await fetch(
        `https://api.github.com/repos/${repoFullName}/commits?per_page=100&page=${page}&since=${sinceStr}&sha=main`,
        { headers: { Authorization: `Bearer ${githubToken}` } }
      )
      const data = await res.json() as GithubCommit[]
      if (!Array.isArray(data) || data.length === 0) break
      total += data.length
      if (data.length < 100) break
      page++
    }
  } else if (gitlabToken) {
    const encodedRepo = encodeURIComponent(repoFullName)
    let page = 1
    while (true) {
      const res  = await fetch(
        `https://gitlab.com/api/v4/projects/${encodedRepo}/repository/commits?per_page=100&page=${page}&since=${sinceStr}&ref_name=main`,
        { headers: { Authorization: `Bearer ${gitlabToken}` } }
      )
      const data = await res.json() as unknown[]
      if (!Array.isArray(data) || data.length === 0) break
      total += data.length
      if (data.length < 100) break
      page++
    }
  }

  return total
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

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id: classId, memberId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const [tsSnap, memberSnap] = await Promise.all([
      getDoc(doc(db, "teamSpaces", classId)),
      getDoc(doc(db, "memberships", memberId)),
    ])

    if (!tsSnap.exists())     return NextResponse.json({ error: "Team not found" },   { status: 404 })
    if (!memberSnap.exists()) return NextResponse.json({ error: "Member not found" }, { status: 404 })

    const ts     = tsSnap.data()
    const member = { membershipId: memberSnap.id, ...memberSnap.data() } as MembershipDoc

    await updateDoc(doc(db, "memberships", memberId), { memberStatus: "analyzing" })

    const repoFullNames: string[] = Array.isArray(ts.repoFullNames)
      ? ts.repoFullNames
      : ts.repoFullName ? [ts.repoFullName as string] : []

    const { githubToken, gitlabToken } = await getProviderTokens(session.user.id)

    const since    = new Date()
    since.setFullYear(since.getFullYear() - 1)
    const sinceStr = since.toISOString()

    const last12Months = getLastNMonths(12)
    const loginKey     = (member.userLogin ?? member.userName)?.toLowerCase()

    const datesByRepo: Record<string, string[]> = {}
    const commitsPerMonthByRepo: Record<string, number[]> = {}
    const commitVelocityByRepo: Record<string, number> = {}
    const contributionShareByRepo: Record<string, number> = {}
    const activityConsistencyByRepo: Record<string, number> = {}
    const activeWeeksRatioByRepo: Record<string, number> = {}
    const statusByRepo: Record<string, string> = {}
    const recommendationByRepo: Record<string, string> = {}

    for (const repoFullName of repoFullNames) {
      const memberDates = await fetchMemberCommitDates(
        repoFullName, loginKey, sinceStr, githubToken, gitlabToken
      )
      const repoTotalCommits = await fetchRepoTotalCommits(
        repoFullName, sinceStr, githubToken, gitlabToken
      )

      datesByRepo[repoFullName] = memberDates

      const memberCommitCount = memberDates.length
      const commitVelocity    = memberCommitCount / 52
      const contributionShare = repoTotalCommits > 0 ? memberCommitCount / repoTotalCommits : 0

      const weeks = new Set(memberDates.map((d: string) => {
        const date        = new Date(d)
        const startOfYear = new Date(date.getFullYear(), 0, 1)
        return Math.floor((date.getTime() - startOfYear.getTime()) / (7 * 86400000))
      }))
      const activeWeeksRatio    = Math.min(weeks.size / 52, 1)
      const activityConsistency = memberCommitCount > 0 ? weeks.size / 52 : 0

      commitVelocityByRepo[repoFullName] = commitVelocity
      contributionShareByRepo[repoFullName] = contributionShare
      activityConsistencyByRepo[repoFullName] = activityConsistency
      activeWeeksRatioByRepo[repoFullName] = activeWeeksRatio

      commitsPerMonthByRepo[repoFullName] = last12Months.map(({ year, month }) =>
        memberDates.filter((d: string) => {
          const date = new Date(d)
          return date.getFullYear() === year && date.getMonth() === month
        }).length
      )

      const mlData = await callMLPredictor(memberCommitCount, contributionShare, weeks.size, activeWeeksRatio)
      statusByRepo[repoFullName] = mlData.status
      recommendationByRepo[repoFullName] = mlData.recommendation
    }

    const allDates = Object.values(datesByRepo).flat()
    const memberCommitCount = allDates.length
    const commitVelocity    = memberCommitCount / 52
    const totalCommits      = Object.values(datesByRepo).reduce((sum, dates) => sum + dates.length, 0)
    const contributionShare = totalCommits > 0 ? memberCommitCount / totalCommits : 0

    const weeks = new Set(allDates.map((d: string) => {
      const date        = new Date(d)
      const startOfYear = new Date(date.getFullYear(), 0, 1)
      return Math.floor((date.getTime() - startOfYear.getTime()) / (7 * 86400000))
    }))
    const activeWeeksRatio    = Math.min(weeks.size / 52, 1)
    const activityConsistency = memberCommitCount > 0 ? weeks.size / 52 : 0

    const commitsPerMonth = last12Months.map(({ year, month }) =>
      allDates.filter((d: string) => {
        const date = new Date(d)
        return date.getFullYear() === year && date.getMonth() === month
      }).length
    )

    const mlData = await callMLPredictor(memberCommitCount, contributionShare, weeks.size, activeWeeksRatio)

    await updateDoc(doc(db, "memberships", memberId), {
      memberStatus:          mlData.status,
      commitVelocity,
      contributionShare,
      activityConsistency,
      activeWeeksRatio,
      commitsPerMonth,
      commitsPerMonthByRepo,
      commitVelocityByRepo,
      contributionShareByRepo,
      activityConsistencyByRepo,
      activeWeeksRatioByRepo,
      statusByRepo,
      recommendationByRepo,
      recommendation:        mlData.recommendation,
      analyzedAt:            new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Analyze member error:", e)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
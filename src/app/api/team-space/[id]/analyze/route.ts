import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore"
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
        `https://api.github.com/repos/${repoFullName}/commits?per_page=100&page=${page}&since=${sinceStr}&sha=main`,
        { headers: { Authorization: `Bearer ${githubToken}` } }
      )
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
        `https://gitlab.com/api/v4/projects/${encodedRepo}/repository/commits?per_page=100&page=${page}&since=${sinceStr}&ref_name=main`,
        { headers: { Authorization: `Bearer ${gitlabToken}` } }
      )
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

    const { githubToken, gitlabToken } = await getProviderTokens(session.user.id)

    const since    = new Date()
    since.setFullYear(since.getFullYear() - 1)
    const sinceStr = since.toISOString()

    const last12Months = getLastNMonths(12)

    const memberStats: Record<string, { commits: number; dates: string[]; datesByRepo: Record<string, string[]> }> = {}
    let totalCommits = 0

    for (const repoFullName of repoFullNames) {
      const commits = await fetchRepoCommits(repoFullName, sinceStr, githubToken, gitlabToken)
      totalCommits += commits.length
      commits.forEach(({ login, date }) => {
        if (!memberStats[login]) memberStats[login] = { commits: 0, dates: [], datesByRepo: {} }
        memberStats[login].commits++
        memberStats[login].dates.push(date)
        if (!memberStats[login].datesByRepo[repoFullName]) memberStats[login].datesByRepo[repoFullName] = []
        memberStats[login].datesByRepo[repoFullName].push(date)
      })
    }

    const ML_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://127.0.0.1:8000"

    for (const member of members) {
      const loginKey = (member.userLogin ?? member.userName)?.toLowerCase()
      const stats    = memberStats[loginKey] || { commits: 0, dates: [], datesByRepo: {} }

      const commitVelocity    = stats.commits / 52
      const contributionShare = totalCommits > 0 ? stats.commits / totalCommits : 0

      const weeks = new Set(stats.dates.map((d: string) => {
        const date        = new Date(d)
        const startOfYear = new Date(date.getFullYear(), 0, 1)
        return Math.floor((date.getTime() - startOfYear.getTime()) / (7 * 86400000))
      }))
      const activeWeeksRatio    = Math.min(weeks.size / 52, 1)
      const activityConsistency = stats.commits > 0 ? weeks.size / 52 : 0

      const commitsPerMonth = last12Months.map(({ year, month }) =>
        stats.dates.filter((d: string) => {
          const date = new Date(d)
          return date.getFullYear() === year && date.getMonth() === month
        }).length
      )

      const commitsPerMonthByRepo: Record<string, number[]> = {}
      for (const repoFullName of repoFullNames) {
        const repoDates = stats.datesByRepo[repoFullName] ?? []
        commitsPerMonthByRepo[repoFullName] = last12Months.map(({ year, month }) =>
          repoDates.filter((d: string) => {
            const date = new Date(d)
            return date.getFullYear() === year && date.getMonth() === month
          }).length
        )
      }

      const mlRes  = await fetch(`${ML_URL}/predict/contributor`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          commit_count:     stats.commits,
          contribution_pct: contributionShare * 100,
          active_weeks:     weeks.size,
          active_ratio:     activeWeeksRatio,
        }),
      })
      const mlData = await mlRes.json() as MlPredictResponse

      await updateDoc(doc(db, "memberships", member.membershipId), {
        memberStatus:          mlData.status,
        commitVelocity,
        contributionShare,
        activityConsistency,
        activeWeeksRatio,
        commitsPerMonth,
        commitsPerMonthByRepo,
        recommendation:        mlData.recommendation,
        analyzedAt:            new Date(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Analyze error:", e)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
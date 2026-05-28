import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
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

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id: classId, memberId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.accessToken || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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

    const repoFullName = ts.repoFullName as string
    const headers      = { Authorization: `Bearer ${session.accessToken}` }

    const since    = new Date()
    since.setFullYear(since.getFullYear() - 1)
    const sinceStr = since.toISOString()

    let allCommits: GithubCommit[] = []
    let commitPage                 = 1
    while (true) {
      const res  = await fetch(
        `https://api.github.com/repos/${repoFullName}/commits?per_page=100&page=${commitPage}&since=${sinceStr}`,
        { headers }
      )
      const data = await res.json() as GithubCommit[]
      if (!Array.isArray(data) || data.length === 0) break
      allCommits = [...allCommits, ...data]
      if (data.length < 100) break
      commitPage++
    }

    const totalCommits = allCommits.length
    const last12Months = getLastNMonths(12)

    const memberStats: Record<string, { commits: number; dates: string[] }> = {}
    allCommits.forEach((c: GithubCommit) => {
      const login = c.author?.login?.toLowerCase()
        || c.commit?.author?.email?.toLowerCase()
        || c.commit?.author?.name?.toLowerCase()
      if (!login) return
      if (!memberStats[login]) memberStats[login] = { commits: 0, dates: [] }
      memberStats[login].commits++
      memberStats[login].dates.push(c.commit?.author?.date || "")
    })

    const loginKey = member.userName?.toLowerCase()
    const stats    = memberStats[loginKey] || { commits: 0, dates: [] }

    const commitVelocity    = stats.commits / 52
    const contributionShare = totalCommits > 0 ? stats.commits / totalCommits : 0

    const weeks = new Set(stats.dates.map((d: string) => {
      const date        = new Date(d)
      const startOfYear = new Date(date.getFullYear(), 0, 1)
      return Math.floor((date.getTime() - startOfYear.getTime()) / (7 * 86400000))
    }))
    const activeWeeksRatio    = Math.min(weeks.size / 52, 1)
    const activityConsistency = stats.commits > 0 ? Math.random() * 2 + 0.5 : 5.0

    const commitsPerMonth = last12Months.map(({ year, month }) =>
      stats.dates.filter((d: string) => {
        const date = new Date(d)
        return date.getFullYear() === year && date.getMonth() === month
      }).length
    )

    const ML_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://127.0.0.1:8000"
    const mlRes  = await fetch(`${ML_URL}/predict/member`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ commit_velocity: commitVelocity, contribution_share: contributionShare, activity_consistency: activityConsistency, active_weeks_ratio: activeWeeksRatio }),
    })
    const mlData = await mlRes.json() as MlPredictResponse

    await updateDoc(doc(db, "memberships", memberId), {
      memberStatus: mlData.memberStatus, commitVelocity, contributionShare,
      activityConsistency, activeWeeksRatio, commitsPerMonth,
      recommendation: mlData.recommendation, analyzedAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Analyze member error:", e)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: classId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.accessToken || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const tsSnap = await getDoc(doc(db, "teamSpaces", classId))
    if (!tsSnap.exists()) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const ts = tsSnap.data()

    // Fetch commits semua member dari GitHub API
    const memberSnap = await getDocs(
      query(collection(db, "memberships"), where("classId", "==", classId))
    )
    const members = memberSnap.docs.map(d => ({ membershipId: d.id, ...d.data() })) as any[]

    // Fetch commit data per member dari GitHub
    const repoFullName  = ts.repoFullName
    const commitsRes    = await fetch(
      `https://api.github.com/repos/${repoFullName}/commits?per_page=100`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    )
    const commits = await commitsRes.json()

    if (!Array.isArray(commits)) {
      return NextResponse.json({ error: "Failed to fetch commits" }, { status: 400 })
    }

    // Hitung kontribusi per member
    const totalCommits = commits.length
    const memberStats: Record<string, { commits: number, dates: string[] }> = {}

    commits.forEach((c: any) => {
      const login = c.author?.login || c.commit?.author?.name
      if (!login) return
      if (!memberStats[login]) memberStats[login] = { commits: 0, dates: [] }
      memberStats[login].commits++
      memberStats[login].dates.push(c.commit?.author?.date || "")
    })

    // Analisis tiap member
    const ML_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://127.0.0.1:8000"

    for (const member of members) {
      const githubLogin = member.userName
      const stats       = memberStats[githubLogin] || { commits: 0, dates: [] }

      // Hitung fitur
      const commitVelocity    = totalCommits > 0 ? stats.commits / 30 : 0
      const contributionShare = totalCommits > 0 ? stats.commits / totalCommits : 0

      // Hitung active weeks dari dates
      const weeks = new Set(stats.dates.map(d => {
        const date = new Date(d)
        const startOfYear = new Date(date.getFullYear(), 0, 1)
        return Math.floor((date.getTime() - startOfYear.getTime()) / (7 * 86400000))
      }))
      const activeWeeksRatio    = Math.min(weeks.size / 10, 1)
      const activityConsistency = stats.commits > 0 ? Math.random() * 2 + 0.5 : 5.0

      // Kirim ke FastAPI
      const mlRes = await fetch(`${ML_URL}/predict/member`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          commit_velocity:      commitVelocity,
          contribution_share:   contributionShare,
          activity_consistency: activityConsistency,
          active_weeks_ratio:   activeWeeksRatio,
        })
      })
      const mlData = await mlRes.json()

      // Update membership di Firestore
      await updateDoc(doc(db, "memberships", member.membershipId), {
        memberStatus:        mlData.memberStatus,
        commitVelocity,
        contributionShare,
        activityConsistency,
        activeWeeksRatio,
        recommendation:      mlData.recommendation,
        analyzedAt:          new Date(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Analyze error:", e)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
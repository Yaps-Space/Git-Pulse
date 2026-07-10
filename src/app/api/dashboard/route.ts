import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const q    = query(collection(db, "repositories"), where("userId", "==", session.user.id))
    const snap = await getDocs(q)

    const repos = snap.docs.map(doc => {
      const data = doc.data()
      return {
        id:                    doc.id,
        fullName:              data.fullName              ?? "",
        provider:              data.provider              ?? "github",
        description:           data.description          ?? null,
        language:              data.language             ?? null,
        stars:                 data.stars                ?? 0,
        forks:                 data.forks                ?? 0,
        isPrivate:             data.isPrivate            ?? false,
        productivityState:     data.productivityState    ?? "-",
        commitFrequency:       data.commitFrequency      ?? 0,
        activityConsistency:   data.activityConsistency  ?? 0,
        commitTrend:           data.commitTrend          ?? 0,
        activeDaysRatio:       data.activeDaysRatio      ?? 0,
        productivityRec:       data.productivityRec      ?? null,
        healthScore:           data.healthScore          ?? 0,
        healthGrade:           data.healthGrade          ?? "-",
        healthLabel:           data.healthLabel          ?? "",
        healthBreakdown:       data.healthBreakdown      ?? {},
        healthRecommendations: data.healthRecommendations ?? [],
        additionsPercent:      data.additionsPercent     ?? 50,
        deletionsPercent:      data.deletionsPercent     ?? 50,
        commitsPerMonth:       data.commitsPerMonth      ?? Array(12).fill(0),
        prPerMonth:            data.prPerMonth           ?? Array(12).fill(0),
        issuesPerMonth:        data.issuesPerMonth       ?? Array(12).fill(0),
        analyzedAt:            data.analyzedAt?.seconds ? data.analyzedAt.seconds * 1000 : null,
      }
    })

    return NextResponse.json(repos)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
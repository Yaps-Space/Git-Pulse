import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { doc, getDoc, deleteDoc } from "firebase/firestore"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    const snap = await getDoc(doc(db, "repositories", id))
    if (!snap.exists()) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (snap.data().userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const data = snap.data()
    return NextResponse.json({
      id:                    snap.id,
      fullName:              data.fullName,
      description:           data.description        ?? null,
      language:              data.language            ?? null,
      stars:                 data.stars               ?? 0,
      forks:                 data.forks               ?? 0,
      isPrivate:             data.isPrivate           ?? false,
      provider:              data.provider            ?? "github",
      productivityState:     data.productivityState   ?? "-",
      commitFrequency:       data.commitFrequency     ?? 0,
      activityConsistency:   data.activityConsistency ?? 0,
      commitTrend:           data.commitTrend         ?? 0,
      activeDaysRatio:       data.activeDaysRatio     ?? 0,
      productivityRec:       data.productivityRec     ?? null,
      healthScore:           data.healthScore         ?? 0,
      healthGrade:           data.healthGrade         ?? "-",
      healthLabel:           data.healthLabel         ?? "",
      healthBreakdown:       data.healthBreakdown     ?? {},
      healthRecommendations: data.healthRecommendations ?? [],
      analyzedAt:            data.analyzedAt?.seconds ? data.analyzedAt.seconds * 1000 : null,
    })
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    const ref  = doc(db, "repositories", id)
    const snap = await getDoc(ref)
    if (!snap.exists()) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (snap.data().userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await deleteDoc(ref)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 })
  }
}
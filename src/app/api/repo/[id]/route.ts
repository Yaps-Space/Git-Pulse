import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { doc, getDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore"

async function canViewRepo(userId: string, repoOwnerId: string, fullName: string) {
  if (repoOwnerId === userId) return true

  const membershipSnap = await getDocs(
    query(
      collection(db, "memberships"),
      where("userId", "==", userId),
      where("role",   "in", ["owner", "evaluator"]),
    )
  )
  if (membershipSnap.empty) return false

  const classIds = membershipSnap.docs.map(d => d.data().classId as string)

  const teamSpaceDocs = await Promise.all(
    classIds.map(classId => getDoc(doc(db, "teamSpaces", classId)))
  )

  return teamSpaceDocs.some(tsSnap => {
    if (!tsSnap.exists()) return false
    const repoFullNames = (tsSnap.data().repoFullNames as string[]) ?? []
    return repoFullNames.includes(fullName)
  })
}

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

    const data = snap.data()

    const allowed = await canViewRepo(session.user.id, data.userId, data.fullName)
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

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
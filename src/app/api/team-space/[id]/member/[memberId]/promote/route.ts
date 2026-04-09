import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id: classId, memberId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const memberSnap = await getDoc(doc(db, "memberships", memberId))
    if (!memberSnap.exists()) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await updateDoc(doc(db, "memberships", memberId), { role: "evaluator" })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
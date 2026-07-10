import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore"

const ALLOWED_ROLES = ["evaluator", "contributor"] as const
type AllowedRole = typeof ALLOWED_ROLES[number]

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id: classId, memberId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { role } = await req.json() as { role: AllowedRole }

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const memberSnap = await getDoc(doc(db, "memberships", memberId))
    if (!memberSnap.exists()) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const mySnap = await getDocs(
      query(
        collection(db, "memberships"),
        where("classId", "==", classId),
        where("userId",  "==", session.user.id),
      )
    )
    if (mySnap.empty) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const myRole     = mySnap.docs[0].data().role as string
    const memberRole = memberSnap.data().role     as string

    if (memberRole === "owner") {
      return NextResponse.json({ error: "Cannot change owner role" }, { status: 403 })
    }
    if (myRole !== "owner" && myRole !== "evaluator") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await updateDoc(doc(db, "memberships", memberId), { role })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { inviteCode } = await req.json()
  if (!inviteCode) return NextResponse.json({ error: "Missing invite code" }, { status: 400 })

  try {
    const tsQuery = query(collection(db, "teamSpaces"), where("inviteCode", "==", inviteCode))
    const tsSnap  = await getDocs(tsQuery)

    if (tsSnap.empty) return NextResponse.json({ error: "Kode undangan tidak valid" }, { status: 404 })

    const tsDoc   = tsSnap.docs[0]
    const classId = tsDoc.id

    const memberQuery = query(collection(db, "memberships"),
      where("classId", "==", classId),
      where("userId",  "==", session.user.id))
    const memberSnap = await getDocs(memberQuery)

    if (!memberSnap.empty) return NextResponse.json({ error: "Kamu sudah terdaftar di Team Space ini" }, { status: 400 })

    await addDoc(collection(db, "memberships"), {
      classId,
      userId:    session.user.id,
      userName:  session.user.name,
      userLogin: session.user.username ?? null,
      userImage: session.user.image,
      role:      "contributor",
      joinedAt:  serverTimestamp(),
      status:    "pending",
    })

    return NextResponse.json({ classId })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to join" }, { status: 500 })
  }
}
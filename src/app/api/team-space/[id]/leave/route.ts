import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: classId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const q    = query(collection(db, "memberships"),
      where("classId", "==", classId),
      where("userId",  "==", session.user.id))
    const snap = await getDocs(q)

    if (snap.empty) return NextResponse.json({ error: "Not a member" }, { status: 404 })

    const membership = snap.docs[0].data()
    if (membership.role === "owner") {
      return NextResponse.json({ error: "Owner tidak bisa keluar. Transfer ownership terlebih dahulu." }, { status: 400 })
    }

    await deleteDoc(doc(db, "memberships", snap.docs[0].id))
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
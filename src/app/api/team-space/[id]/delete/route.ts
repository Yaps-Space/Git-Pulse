import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: classId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const tsSnap = await getDoc(doc(db, "teamSpaces", classId))
    if (!tsSnap.exists()) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (tsSnap.data().ownerId !== session.user.id) {
      return NextResponse.json({ error: "Hanya owner yang bisa menghapus Team Space" }, { status: 403 })
    }

    // Hapus semua memberships
    const memberSnap = await getDocs(
      query(collection(db, "memberships"), where("classId", "==", classId))
    )
    await Promise.all(memberSnap.docs.map(d => deleteDoc(doc(db, "memberships", d.id))))

    // Hapus team space
    await deleteDoc(doc(db, "teamSpaces", classId))
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
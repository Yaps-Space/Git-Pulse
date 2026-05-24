import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { doc, getDoc, deleteDoc } from "firebase/firestore"

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
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 })
  }
}
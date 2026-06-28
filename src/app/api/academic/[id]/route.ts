import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { doc, deleteDoc, getDoc } from "firebase/firestore"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const type   = req.nextUrl.searchParams.get("type")

  if (type !== "academicYear" && type !== "studyProgram") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  }

  const collectionName = type === "academicYear" ? "academicYears" : "studyPrograms"

  try {
    const snap = await getDoc(doc(db, collectionName, id))
    if (!snap.exists()) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (snap.data().createdBy !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await deleteDoc(doc(db, collectionName, id))
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
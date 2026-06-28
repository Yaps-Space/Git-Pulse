import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, getDocs, addDoc, serverTimestamp, orderBy, query } from "firebase/firestore"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const [aySnap, spSnap] = await Promise.all([
      getDocs(query(collection(db, "academicYears"), orderBy("createdAt", "desc"))),
      getDocs(query(collection(db, "studyPrograms"), orderBy("createdAt", "asc"))),
    ])

    return NextResponse.json({
      academicYears: aySnap.docs.map(d => ({
        id:        d.id,
        label:     d.data().label     as string,
        createdBy: d.data().createdBy as string ?? null,
      })),
      studyPrograms: spSnap.docs.map(d => ({
        id:        d.id,
        label:     d.data().label     as string,
        createdBy: d.data().createdBy as string ?? null,
      })),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { type, label } = await req.json()
  if (!type || !label?.trim()) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  if (type !== "academicYear" && type !== "studyProgram") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  }

  const collectionName = type === "academicYear" ? "academicYears" : "studyPrograms"

  try {
    const ref = await addDoc(collection(db, collectionName), {
      label:     label.trim(),
      createdAt: serverTimestamp(),
      createdBy: session.user.id,
    })
    return NextResponse.json({ id: ref.id, label: label.trim(), createdBy: session.user.id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
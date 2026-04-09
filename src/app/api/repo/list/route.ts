import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const q    = query(collection(db, "repositories"), where("userId", "==", session.user.id))
    const snap = await getDocs(q)
    const repos = snap.docs.map(d => ({ id: d.id, fullName: d.data().fullName }))
    return NextResponse.json({ repos })
  } catch (e) {
    return NextResponse.json({ repos: [] })
  }
}
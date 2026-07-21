import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const q    = query(collection(db, "repositories"), where("userId", "==", session.user.id))
    const snap = await getDocs(q)
    const fullNames = snap.docs
      .filter(doc => doc.data().isPersonalRepo !== false)
      .map(doc => doc.data().fullName ?? "")
    return NextResponse.json({ fullNames })
  } catch {
    return NextResponse.json({ fullNames: [] })
  }
}
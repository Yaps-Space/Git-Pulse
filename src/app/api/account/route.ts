import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const snap = await getDoc(doc(db, "users", session.user.id))

    const createdAt = snap.exists() && snap.data().createdAt?.seconds
      ? new Date(snap.data().createdAt.seconds * 1000).toLocaleDateString("id-ID", {
          day:   "numeric",
          month: "long",
          year:  "numeric",
        })
      : "-"

    return NextResponse.json({
      name:      session.user.name      ?? "",
      username:  session.user.username  ?? "",
      email:     session.user.email     ?? "",
      avatar:    session.user.image     ?? "",
      createdAt,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to fetch account" }, { status: 500 })
  }
}
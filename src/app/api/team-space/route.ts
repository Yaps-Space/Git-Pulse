import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, description, repoFullName } = await req.json()
  if (!name || !repoFullName) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  try {
    const inviteCode = generateInviteCode()

    // Buat Team Space
    const tsRef = await addDoc(collection(db, "teamSpaces"), {
      name,
      description:  description || null,
      repoFullName,
      ownerId:      session.user.id,
      inviteCode,
      createdAt:    serverTimestamp(),
    })

    // Buat membership owner
    await addDoc(collection(db, "memberships"), {
      classId:  tsRef.id,
      userId:   session.user.id,
      userName: session.user.name,
      userImage:session.user.image,
      role:     "owner",
      joinedAt: serverTimestamp(),
      status:   "pending",
    })

    return NextResponse.json({ id: tsRef.id, inviteCode })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}
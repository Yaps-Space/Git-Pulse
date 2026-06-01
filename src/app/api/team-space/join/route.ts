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

    const tsDoc       = tsSnap.docs[0]
    const classId     = tsDoc.id
    const repoFullName = tsDoc.data().repoFullName as string

    const memberQuery = query(collection(db, "memberships"),
      where("classId", "==", classId),
      where("userId",  "==", session.user.id))
    const memberSnap = await getDocs(memberQuery)

    if (!memberSnap.empty) return NextResponse.json({ error: "Kamu sudah terdaftar di Team Space ini" }, { status: 400 })

    const userLogin = session.user.username?.toLowerCase()
    if (!userLogin) return NextResponse.json({ error: "GitHub username tidak ditemukan" }, { status: 400 })

    let isContributor = false
    let page          = 1
    while (true) {
      const res  = await fetch(
        `https://api.github.com/repos/${repoFullName}/contributors?per_page=100&page=${page}`,
        { headers: { Authorization: `Bearer ${session.accessToken}` } }
      )
      if (!res.ok) break
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) break
      if (data.some((c: { login: string }) => c.login.toLowerCase() === userLogin)) {
        isContributor = true
        break
      }
      if (data.length < 100) break
      page++
    }

    if (!isContributor) {
      return NextResponse.json({
        error: "Kamu tidak dapat bergabung karena bukan kontributor di repository ini"
      }, { status: 403 })
    }

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
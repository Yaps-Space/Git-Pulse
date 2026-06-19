import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs, addDoc, serverTimestamp, DocumentData } from "firebase/firestore"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { inviteCode } = await req.json()
  if (!inviteCode) return NextResponse.json({ error: "Missing invite code" }, { status: 400 })

  try {
    const tsSnap = await getDocs(
      query(collection(db, "teamSpaces"), where("inviteCode", "==", inviteCode))
    )

    if (tsSnap.empty) return NextResponse.json({ error: "Kode undangan tidak valid" }, { status: 404 })

    const tsDoc   = tsSnap.docs[0]
    const classId = tsDoc.id
    const ts      = tsDoc.data() as DocumentData

    // Handle legacy dan baru
    const repoFullNames: string[] = Array.isArray(ts.repoFullNames)
      ? ts.repoFullNames
      : ts.repoFullName ? [ts.repoFullName as string] : []

    const memberSnap = await getDocs(
      query(
        collection(db, "memberships"),
        where("classId", "==", classId),
        where("userId",  "==", session.user.id)
      )
    )
    if (!memberSnap.empty) return NextResponse.json({ error: "Kamu sudah terdaftar di Team Space ini" }, { status: 400 })

    const userLogin = session.user.username?.toLowerCase()
    if (!userLogin) return NextResponse.json({ error: "GitHub username tidak ditemukan" }, { status: 400 })

    // Cek contributor di SEMUA repo
    const contributorChecks = await Promise.all(
      repoFullNames.map(async (repoFullName) => {
        let page = 1
        while (true) {
          const res = await fetch(
            `https://api.github.com/repos/${repoFullName}/contributors?per_page=100&page=${page}`,
            { headers: { Authorization: `Bearer ${session.accessToken}` } }
          )
          if (!res.ok) return false
          const data = await res.json()
          if (!Array.isArray(data) || data.length === 0) return false
          if (data.some((c: { login: string }) => c.login.toLowerCase() === userLogin)) return true
          if (data.length < 100) return false
          page++
        }
      })
    )

    const isContributorInAll = contributorChecks.every(Boolean)

    if (!isContributorInAll) {
      return NextResponse.json({
        error: "Kamu tidak dapat bergabung karena bukan kontributor di semua repository yang terhubung"
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
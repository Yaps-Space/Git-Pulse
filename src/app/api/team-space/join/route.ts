import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs, addDoc, updateDoc, serverTimestamp } from "firebase/firestore"

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

    const classId  = tsSnap.docs[0].id
    const userLogin = session.user.username?.toLowerCase() ?? null

    /** Cek sudah join by userId */
    const alreadyJoined = await getDocs(
      query(
        collection(db, "memberships"),
        where("classId", "==", classId),
        where("userId",  "==", session.user.id)
      )
    )
    if (!alreadyJoined.empty) {
      return NextResponse.json({ error: "Kamu sudah terdaftar di Team Space ini" }, { status: 400 })
    }

    /**
     * Cari slot membership yang disiapkan owner saat create (userId masih null).
     * Kalau ketemu → claim slot (update doc yang ada).
     * Kalau tidak → buat membership baru sebagai outsider.
     */
    if (userLogin) {
      const preSnap = await getDocs(
        query(
          collection(db, "memberships"),
          where("classId",   "==", classId),
          where("userLogin", "==", userLogin),
          where("userId",    "==", null)
        )
      )

      if (!preSnap.empty) {
        /** Claim slot yang sudah disiapkan owner */
        await updateDoc(preSnap.docs[0].ref, {
          userId:      session.user.id,
          userName:    session.user.name ?? userLogin,
          userImage:   session.user.image ?? null,
          joinedAt:    serverTimestamp(),
          memberStatus: "pending",
        })
        return NextResponse.json({ classId })
      }
    }

    /** Tidak ada slot — join sebagai outsider */
    await addDoc(collection(db, "memberships"), {
      classId,
      userId:      session.user.id,
      userName:    session.user.name ?? userLogin ?? "Unknown",
      displayName: null,
      userLogin,
      userImage:   session.user.image ?? null,
      role:        "contributor",
      joinedAt:    serverTimestamp(),
      memberStatus: "pending",
      isOutsider:  true,
    })

    return NextResponse.json({ classId })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to join" }, { status: 500 })
  }
}
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  DocumentData,
} from "firebase/firestore"
import { Membership, TeamResult } from "@/shared/types/api"

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const membershipsSnap = await getDocs(
      query(collection(db, "memberships"), where("userId", "==", session.user.id))
    )

    const memberships: Membership[] = membershipsSnap.docs.map(d => ({
      id:      d.id,
      classId: (d.data() as DocumentData).classId as string,
      role:    (d.data() as DocumentData).role    as string,
    }))

    const teams = await Promise.all(
      memberships.map(async (m): Promise<TeamResult | null> => {
        const tsSnap = await getDocs(
          query(collection(db, "teamSpaces"), where("__name__", "==", m.classId))
        )
        if (tsSnap.empty) return null

        const ts = tsSnap.docs[0].data() as DocumentData

        const memberSnap = await getDocs(
          query(collection(db, "memberships"), where("classId", "==", m.classId))
        )

        return {
          id:          m.classId,
          name:        ts.name        as string,
          description: ts.description as string | null,
          repoName:    ts.repoFullName as string,
          role:        m.role,
          memberCount: memberSnap.size,
        }
      })
    )

    return NextResponse.json(teams.filter((t): t is TeamResult => t !== null))
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, description, repoFullName, importLogins } = await req.json()
  if (!name || !repoFullName) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  try {
    const inviteCode = generateInviteCode()

    const tsRef = await addDoc(collection(db, "teamSpaces"), {
      name,
      description:  description || null,
      repoFullName,
      ownerId:      session.user.id,
      inviteCode,
      createdAt:    serverTimestamp(),
    })

    await addDoc(collection(db, "memberships"), {
      classId:   tsRef.id,
      userId:    session.user.id,
      userName:  session.user.name,
      userLogin: session.user.username ?? null,
      userImage: session.user.image,
      role:      "owner",
      joinedAt:  serverTimestamp(),
      status:    "pending",
    })

    if (Array.isArray(importLogins) && importLogins.length > 0) {
      const ownerLogin = session.user.username?.toLowerCase()
      const toImport   = (importLogins as string[]).filter(l => l.toLowerCase() !== ownerLogin)

      await Promise.all(toImport.map(async (login: string) => {
        const usersSnap = await getDocs(
          query(collection(db, "users"), where("username", "==", login))
        )
        if (usersSnap.empty) return

        const userData = usersSnap.docs[0].data()
        await addDoc(collection(db, "memberships"), {
          classId:   tsRef.id,
          userId:    usersSnap.docs[0].id,
          userName:  userData.name  ?? login,
          userLogin: login,
          userImage: userData.image ?? null,
          role:      "contributor",
          joinedAt:  serverTimestamp(),
          status:    "pending",
        })
      }))
    }

    return NextResponse.json({ id: tsRef.id, inviteCode })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}
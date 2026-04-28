import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc, DocumentData } from "firebase/firestore"
import { TeamMember, TeamSpaceDetail } from "@/features/team-space/types/TeamSpace"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    const tsSnap = await getDoc(doc(db, "teamSpaces", id))
    if (!tsSnap.exists()) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const ts = tsSnap.data() as DocumentData

    const memberSnap = await getDocs(
      query(collection(db, "memberships"), where("classId", "==", id))
    )

    const members: TeamMember[] = memberSnap.docs.map(d => {
      const m = d.data() as DocumentData
      return {
        id:                  d.id,
        userId:              m.userId               as string,
        userName:            m.userName             as string,
        userImage:           m.userImage            as string,
        role:                m.role                 as string,
        status:              (m.memberStatus        as string) || "pending",
        commitVelocity:      (m.commitVelocity      as number) || 0,
        contributionShare:   (m.contributionShare   as number) || 0,
        activityConsistency: (m.activityConsistency as number) || 0,
        activeWeeksRatio:    (m.activeWeeksRatio    as number) || 0,
        recommendation:      (m.recommendation      as string) || null,
        joinedAt:            m.joinedAt?.seconds ? (m.joinedAt.seconds as number) * 1000 : null,
      }
    })

    const myMembership = members.find(m => m.userId === session.user.id)
    if (!myMembership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const detail: TeamSpaceDetail = {
      id,
      name:         ts.name          as string,
      description:  (ts.description  as string) || null,
      repoFullName: ts.repoFullName   as string,
      ownerId:      ts.ownerId        as string,
      inviteCode:   ts.inviteCode     as string,
      myRole:       myMembership.role,
      myMembership,
      members,
    }

    return NextResponse.json(detail)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to fetch detail" }, { status: 500 })
  }
}
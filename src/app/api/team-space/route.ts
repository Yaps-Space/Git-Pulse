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
  doc,
  getDoc,
  DocumentData,
} from "firebase/firestore"
import { Membership, TeamResult } from "@/shared/types/api"

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function avgGrade(score: number): string {
  if (score >= 75) return "A"
  if (score >= 60) return "B"
  if (score >= 45) return "C"
  if (score >= 30) return "D"
  return "E"
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

        const repoNames: string[] = Array.isArray(ts.repoFullNames)
          ? ts.repoFullNames
          : ts.repoFullName ? [ts.repoFullName as string] : []

        let totalHealth              = 0
        let healthCount              = 0
        const productivityStates: string[] = []

        await Promise.all(repoNames.map(async (repoFullName) => {
          try {
            const repoSnap = await getDocs(
              query(
                collection(db, "repositories"),
                where("fullName", "==", repoFullName)
              )
            )
            if (!repoSnap.empty) {
              const repo = repoSnap.docs[0].data() as DocumentData
              totalHealth += repo.healthScore ?? 0
              healthCount++
              if (repo.productivityState) {
                productivityStates.push(repo.productivityState as string)
              }
            }
          } catch { /* skip */ }
        }))

        const avgHealthScore = healthCount > 0
          ? Math.round((totalHealth / healthCount) * 10) / 10
          : 0

        let academicYear: string | null = null
        let studyProgram: string | null = null

        if (ts.academicYearId) {
          try {
            const aySnap = await getDoc(doc(db, "academicYears", ts.academicYearId as string))
            if (aySnap.exists()) academicYear = (aySnap.data() as DocumentData).label as string ?? null
          } catch { /* silent */ }
        }

        if (ts.studyProgramId) {
          try {
            const spSnap = await getDoc(doc(db, "studyPrograms", ts.studyProgramId as string))
            if (spSnap.exists()) studyProgram = (spSnap.data() as DocumentData).label as string ?? null
          } catch { /* silent */ }
        }

        return {
          id:                 m.classId,
          name:               ts.name        as string,
          description:        ts.description as string | null,
          repoNames,
          role:               m.role,
          memberCount:        memberSnap.size,
          avgHealthScore,
          avgHealthGrade:     avgGrade(avgHealthScore),
          academicYear,
          studyProgram,
          projectManager:     (ts.projectManager as string) || null,
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

  const { name, description, repoFullNames, academicYearId, studyProgramId, projectManager, importMembers } = await req.json()
  if (!name || !repoFullNames?.length) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  try {
    const userSnap = await getDoc(doc(db, "users", session.user.id))
    const userName = userSnap.exists()
      ? (userSnap.data().name ?? session.user.name)
      : session.user.name

    const inviteCode = generateInviteCode()

    const tsRef = await addDoc(collection(db, "teamSpaces"), {
      name,
      description:    description    || null,
      repoFullNames,
      academicYearId: academicYearId || null,
      studyProgramId: studyProgramId || null,
      projectManager: projectManager || null,
      ownerId:        session.user.id,
      inviteCode,
      createdAt:      serverTimestamp(),
    })

    await addDoc(collection(db, "memberships"), {
      classId:      tsRef.id,
      userId:       session.user.id,
      userName,
      displayName:  null,
      userLogin:    session.user.username ?? null,
      userImage:    session.user.image,
      role:         "owner",
      joinedAt:     serverTimestamp(),
      memberStatus: "pending",
    })

    if (Array.isArray(importMembers) && importMembers.length > 0) {
      const ownerLogin = session.user.username?.toLowerCase()

      await Promise.all(
        (importMembers as { login: string; displayName: string }[])
          .filter(m => m.login.toLowerCase() !== ownerLogin)
          .map(async ({ login, displayName }) => {
            const usersSnap = await getDocs(
              query(collection(db, "users"), where("username", "==", login))
            )

            const userData = !usersSnap.empty ? usersSnap.docs[0].data() : null
            const userId   = !usersSnap.empty ? usersSnap.docs[0].id     : null

            await addDoc(collection(db, "memberships"), {
              classId:      tsRef.id,
              userId,
              userName:     userData?.name  ?? login,
              displayName:  displayName?.trim() || null,
              userLogin:    login,
              userImage:    userData?.image ?? null,
              role:         "contributor",
              joinedAt:     userId ? serverTimestamp() : null,
              memberStatus: userId ? "pending" : "not_joined",
              isOutsider:   false,
            })
          })
      )
    }

    return NextResponse.json({ id: tsRef.id, inviteCode })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}
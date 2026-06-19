import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc, DocumentData } from "firebase/firestore"
import { TeamMember } from "@/features/team-space/types/TeamSpace"
import { TeamSpaceDetail, RepoHealth } from "@/features/team-space/detail/types/TeamSpaceDetail"
import { GithubCommit } from "@/features/team-space/detail/types/analyzeTypes"

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

    const ts  = tsSnap.data() as DocumentData
    const now = new Date()

    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

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
        commitsPerMonth:     (m.commitsPerMonth     as number[]) || Array(12).fill(0),
        recommendation:      (m.recommendation      as string) || null,
        joinedAt:            m.joinedAt?.seconds ? (m.joinedAt.seconds as number) * 1000 : null,
      }
    })

    const myMembership = members.find(m => m.userId === session.user.id)
    if (!myMembership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    /** Support legacy single-repo (repoFullName) and new multi-repo (repoFullNames) */
    const repoFullNames: string[] = Array.isArray(ts.repoFullNames)
      ? ts.repoFullNames
      : ts.repoFullName ? [ts.repoFullName as string] : []

    const since    = new Date(now)
    since.setFullYear(since.getFullYear() - 1)
    const sinceStr = since.toISOString()

    /**
     * Fetch commit dates per repo and map them into monthly buckets.
     * Result: { "owner/repo": [0, 3, 5, ...] } — 12 values, oldest to newest.
     */
    const repoCommitsPerMonth: Record<string, number[]> = {}

    for (const repoName of repoFullNames) {
      const monthlyCounts = Array(12).fill(0)

      try {
        let page = 1
        while (true) {
          const res  = await fetch(
            `https://api.github.com/repos/${repoName}/commits?per_page=100&page=${page}&since=${sinceStr}&sha=main`,
            { headers: { Authorization: `Bearer ${session.accessToken}` } }
          )
          const data = await res.json() as GithubCommit[]
          if (!Array.isArray(data) || data.length === 0) break

          data.forEach((c: GithubCommit) => {
            const date = c.commit?.author?.date
            if (!date) return
            const d        = new Date(date)
            const matchIdx = last12Months.findIndex(
              m => m.year === d.getFullYear() && m.month === d.getMonth()
            )
            if (matchIdx !== -1) monthlyCounts[matchIdx]++
          })

          if (data.length < 100) break
          page++
        }
      } catch {
        // Keep monthlyCounts as zeros if fetch fails for this repo
      }

      repoCommitsPerMonth[repoName] = monthlyCounts
    }

    /** Fetch health score and productivity state for each linked repository */
    const repoHealthList: RepoHealth[] = []
    for (const repoName of repoFullNames) {
      try {
        const repoSnap = await getDocs(
          query(
            collection(db, "repositories"),
            where("userId",   "==", session.user.id),
            where("fullName", "==", repoName)
          )
        )
        if (!repoSnap.empty) {
          const repo = repoSnap.docs[0].data() as DocumentData
          repoHealthList.push({
            repoFullName:      repoName,
            repoId:            repoSnap.docs[0].id,
            healthScore:       repo.healthScore       ?? 0,
            healthGrade:       repo.healthGrade       ?? "-",
            productivityState: repo.productivityState ?? "-",
          })
        } else {
          repoHealthList.push({
            repoFullName: repoName,
            repoId:       null,
            healthScore:       0,
            healthGrade:       "-",
            productivityState: "-",
          })
        }
      } catch {
        repoHealthList.push({
          repoFullName: repoName,
          repoId:       null,
          healthScore:       0,
          healthGrade:       "-",
          productivityState: "-",
        })
      }
    }

    const detail: TeamSpaceDetail = {
      id,
      name:                ts.name         as string,
      description:         (ts.description as string) || null,
      repoFullNames,
      ownerId:             ts.ownerId       as string,
      inviteCode:          ts.inviteCode    as string,
      createdAt:           ts.createdAt?.seconds ? (ts.createdAt.seconds as number) * 1000 : null,
      myRole:              myMembership.role,
      myMembership,
      members,
      repoCommitsPerMonth,
      repoHealthList,
    }

    return NextResponse.json(detail)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to fetch detail" }, { status: 500 })
  }
}
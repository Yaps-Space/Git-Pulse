import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc, updateDoc, DocumentData } from "firebase/firestore"
import { TeamMember } from "@/features/team-space/types/TeamSpace"
import { TeamSpaceDetail, RepoHealth } from "@/features/team-space/detail/types/TeamSpaceDetail"
import { GithubCommit } from "@/features/team-space/detail/types/analyzeTypes"
import { getProviderTokens } from "@/shared/lib/getProviderTokens"

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
        id:                          d.id,
        userId:                      (m.userId      as string)  ?? null,
        userName:                    m.userName                 as string,
        displayName:                 (m.displayName as string)  || null,
        userLogin:                   (m.userLogin   as string)  || null,
        userImage:                   (m.userImage   as string)  || null,
        role:                        m.role                     as string,
        status:                      (m.memberStatus as string)  || "pending",
        commitVelocity:              (m.commitVelocity      as number) || 0,
        contributionShare:           (m.contributionShare   as number) || 0,
        activityConsistency:         (m.activityConsistency as number) || 0,
        activeWeeksRatio:            (m.activeWeeksRatio    as number) || 0,
        commitsPerMonth:             (m.commitsPerMonth     as number[]) || Array(12).fill(0),
        commitsPerMonthByRepo:       (m.commitsPerMonthByRepo       as Record<string, number[]>) || {},
        commitVelocityByRepo:        (m.commitVelocityByRepo        as Record<string, number>) || {},
        contributionShareByRepo:     (m.contributionShareByRepo     as Record<string, number>) || {},
        activityConsistencyByRepo:   (m.activityConsistencyByRepo   as Record<string, number>) || {},
        activeWeeksRatioByRepo:      (m.activeWeeksRatioByRepo      as Record<string, number>) || {},
        statusByRepo:                (m.statusByRepo                as Record<string, string>) || {},
        recommendationByRepo:        (m.recommendationByRepo        as Record<string, string>) || {},
        recommendation:              (m.recommendation      as string) || null,
        joinedAt:                    m.joinedAt?.seconds ? (m.joinedAt.seconds as number) * 1000 : null,
        isOutsider:                  (m.isOutsider          as boolean) || false,
      }
    })

    const myMembership = members.find(m => m.userId === session.user.id)
    if (!myMembership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const repoFullNames: string[] = Array.isArray(ts.repoFullNames)
      ? ts.repoFullNames
      : ts.repoFullName ? [ts.repoFullName as string] : []

    const { githubToken, gitlabToken } = await getProviderTokens(session.user.id)

    const since    = new Date(now)
    since.setFullYear(since.getFullYear() - 1)
    const sinceStr = since.toISOString()

    const repoCommitsPerMonth: Record<string, number[]> = {}

    for (const repoName of repoFullNames) {
      const monthlyCounts = Array(12).fill(0)

      try {
        const isGitlab = !githubToken && !!gitlabToken
        const token    = isGitlab ? gitlabToken : githubToken
        if (!token) { repoCommitsPerMonth[repoName] = monthlyCounts; continue }

        let page = 1
        while (true) {
          const url = isGitlab
            ? `https://gitlab.com/api/v4/projects/${encodeURIComponent(repoName)}/repository/commits?per_page=100&page=${page}&since=${sinceStr}&ref_name=main`
            : `https://api.github.com/repos/${repoName}/commits?per_page=100&page=${page}&since=${sinceStr}&sha=main`

          const res  = await fetch(url, {
            headers: { Authorization: isGitlab ? `Bearer ${token}` : `token ${token}` }
          })
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

    const repoHealthList: RepoHealth[] = []
    for (const repoName of repoFullNames) {
      try {
        const repoSnap = await getDocs(
          query(
            collection(db, "repositories"),
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
            provider:          repo.provider          ?? "github",
          })
        } else {
          repoHealthList.push({
            repoFullName: repoName,
            repoId:       null,
            healthScore:  0,
            healthGrade:  "-",
            productivityState: "-",
            provider:     "github",
          })
        }
      } catch {
        repoHealthList.push({
          repoFullName: repoName,
          repoId:       null,
          healthScore:  0,
          healthGrade:  "-",
          productivityState: "-",
          provider:     "github",
        })
      }
    }

    let academicYearLabel:  string | null = null
    let studyProgramLabel:  string | null = null

    if (ts.academicYearId) {
      try {
        const aySnap = await getDoc(doc(db, "academicYears", ts.academicYearId as string))
        if (aySnap.exists()) academicYearLabel = (aySnap.data() as DocumentData).label as string ?? null
      } catch { /* silent */ }
    }

    if (ts.studyProgramId) {
      try {
        const spSnap = await getDoc(doc(db, "studyPrograms", ts.studyProgramId as string))
        if (spSnap.exists()) studyProgramLabel = (spSnap.data() as DocumentData).label as string ?? null
      } catch { /* silent */ }
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
      academicYear:        academicYearLabel,
      studyProgram:        studyProgramLabel,
      academicYearId:      (ts.academicYearId as string) || null,
      studyProgramId:      (ts.studyProgramId as string) || null,
      projectManager:      (ts.projectManager as string) || null,
      repoCommitsPerMonth,
      repoHealthList,
    }

    return NextResponse.json(detail)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to fetch detail" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const tsRef  = doc(db, "teamSpaces", id)
    const tsSnap = await getDoc(tsRef)
    if (!tsSnap.exists()) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const ts = tsSnap.data() as DocumentData
    if (ts.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json() as {
      name?:           string
      description?:    string | null
      projectManager?: string | null
      academicYearId?: string | null
      studyProgramId?: string | null
    }

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    await updateDoc(tsRef, {
      name:           body.name.trim(),
      description:    body.description?.trim()   || null,
      projectManager: body.projectManager?.trim() || null,
      academicYearId: body.academicYearId         || null,
      studyProgramId: body.studyProgramId         || null,
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to update team space" }, { status: 500 })
  }
}
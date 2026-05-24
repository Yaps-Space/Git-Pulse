import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/shared/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { PageShell } from "@/shared/components/commons/PageShell"
import { RepoDetail } from "@/features/repository/detail/types/RepoDetail"
import { RepoDetailView } from "@/features/repository/detail/components/RepoDetailView"

async function getRepo(id: string): Promise<RepoDetail | null> {
  try {
    const snap = await getDoc(doc(db, "repositories", id))
    if (!snap.exists()) return null
    const data = snap.data()
    return {
      id:                    snap.id,
      fullName:              data.fullName,
      description:           data.description       ?? null,
      language:              data.language           ?? null,
      stars:                 data.stars              ?? 0,
      forks:                 data.forks              ?? 0,
      isPrivate:             data.isPrivate          ?? false,
      productivityState:     data.productivityState  ?? "-",
      commitFrequency:       data.commitFrequency    ?? 0,
      activityConsistency:   data.activityConsistency ?? 0,
      commitTrend:           data.commitTrend        ?? 0,
      activeDaysRatio:       data.activeDaysRatio    ?? 0,
      productivityRec:       data.productivityRec    ?? null,
      healthScore:           data.healthScore        ?? 0,
      healthGrade:           data.healthGrade        ?? "-",
      healthLabel:           data.healthLabel        ?? "",
      healthBreakdown:       data.healthBreakdown    ?? {},
      healthRecommendations: data.healthRecommendations ?? [],
      analyzedAt:            data.analyzedAt?.seconds ? data.analyzedAt.seconds * 1000 : null,
    }
  } catch {
    return null
  }
}

export default async function RepoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const repo = await getRepo(id)
  if (!repo) redirect("/repository")

  return (
    <PageShell title="Repository" detail={repo.fullName}>
      <RepoDetailView repo={repo} />
    </PageShell>
  )
}
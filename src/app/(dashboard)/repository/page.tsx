import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { PageShell } from "@/shared/components/commons/PageShell"
import { RepoTable } from "@/features/repository/components/RepoTable"
import { Repo } from "@/features/repository/types"

async function getUserRepos(userId: string): Promise<Repo[]> {
  try {
    const q    = query(collection(db, "repositories"), where("userId", "==", userId))
    const snap = await getDocs(q)
    return snap.docs.map(doc => {
      const data = doc.data()
      return {
        id:                doc.id,
        fullName:          data.fullName          ?? "",
        productivityState: data.productivityState ?? "-",
        healthScore:       data.healthScore       ?? 0,
        healthGrade:       data.healthGrade       ?? "-",
        analyzedAt:        data.analyzedAt?.seconds ? data.analyzedAt.seconds * 1000 : null,
      }
    })
  } catch {
    return []
  }
}

export default async function RepositoryPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const repos = await getUserRepos(session.user.id)

  return (
    <PageShell title="Repository">
      <RepoTable repos={repos} />
    </PageShell>
  )
}
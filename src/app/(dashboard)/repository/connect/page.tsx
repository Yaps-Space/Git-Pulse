import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { PageShell } from "@/shared/components/commons/PageShell"
import { ConnectRepoPage } from "@/features/repository/components/ConnectRepoPage"

async function getConnectedFullNames(userId: string): Promise<string[]> {
  try {
    const q    = query(collection(db, "repositories"), where("userId", "==", userId))
    const snap = await getDocs(q)
    return snap.docs.map(doc => doc.data().fullName ?? "")
  } catch {
    return []
  }
}

export default async function ConnectPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const connectedFullNames = await getConnectedFullNames(session.user.id)

  return (
    <PageShell title="Repository" detail="Connect Repository">
      <ConnectRepoPage connectedFullNames={connectedFullNames} />
    </PageShell>
  )
}
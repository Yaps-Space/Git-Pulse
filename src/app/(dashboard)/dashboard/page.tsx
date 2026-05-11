import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { PageShell } from "@/shared/components/commons/PageShell"
import { DashboardContent } from "@/features/dashboard/components/DashboardContent"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  return (
    <PageShell title="Dashboard">
      <DashboardContent name={session.user.name?.split(" ")[0] ?? "User"} />
    </PageShell>
  )
}
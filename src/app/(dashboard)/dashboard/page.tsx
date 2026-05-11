import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { PageShell } from "@/shared/components/commons/PageShell"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  return (
    <PageShell title="Dashboard">
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="text-5xl">🚧</span>
        <p className="font-medium text-gray-700">Dashboard sedang dalam pengembangan</p>
        <p className="text-sm text-gray-400">Fitur akan segera hadir</p>
      </div>
    </PageShell>
  )
}
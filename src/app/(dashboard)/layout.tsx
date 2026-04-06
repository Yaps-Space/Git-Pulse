import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/dashboard/Sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) redirect("/login")

  return (
    <div className="flex min-h-screen" style={{ background: "#F4F6F9" }}>
      <Sidebar user={session.user} />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  )
}
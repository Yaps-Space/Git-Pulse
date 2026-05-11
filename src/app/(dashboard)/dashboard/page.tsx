import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  return <DashboardLayout name={session.user.name?.split(" ")[0] ?? "User"} />
}
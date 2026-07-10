import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { AuthShell } from "@/shared/components/commons/AutoShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) redirect("/login")

  return <AuthShell user={session.user}>{children}</AuthShell>;
}
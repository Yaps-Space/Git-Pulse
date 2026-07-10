import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { LandingLayout } from "@/features/landing/components/LandingLayout"

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")
  return <LandingLayout />
}
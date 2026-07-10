"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, Suspense } from "react"
import { LoginLayout } from "@/features/login/components/LoginLayout"

export default function LoginPage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard")
  }, [status, router])

  return (
    <Suspense fallback={null}>
      <LoginLayout />
    </Suspense>
  )
}
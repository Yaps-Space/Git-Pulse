"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { RegisterLayout } from "@/features/login/components/RegisterLayout"

export default function RegisterPage() {
  const { status } = useSession()
  const router     = useRouter()

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard")
  }, [status, router])

  return <RegisterLayout />
}
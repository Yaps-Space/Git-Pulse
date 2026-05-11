"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RotateCw } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

export default function RefreshButton({ repoId, fullName }: { repoId: string; fullName: string }) {
  const [loading, setLoading] = useState(false)
  const router                = useRouter()

  const refresh = async () => {
    setLoading(true)
    try {
      await fetch("/api/repo/analyze", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ fullName }),
      })
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={refresh}
      disabled={loading}
    >
      <RotateCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Menganalisis..." : "Refresh Analysis"}
    </Button>
  )
}
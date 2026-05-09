"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/components/ui/button"
import { BarChart2 } from "lucide-react"

interface Props {
  classId: string;
}

export default function MemberManagement({ classId }: Props) {
  const router              = useRouter()
  const [loading, setLoading] = useState(false)

  const analyzeAll = async () => {
    setLoading(true)
    try {
      await fetch(`/api/team-space/${classId}/analyze`, { method: "POST" })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={analyzeAll}
      disabled={loading}
      className="gap-2 text-white"
      style={{ background: "#6265FE", opacity: loading ? 0.7 : 1 }}
    >
      <BarChart2 className="w-4 h-4" />
      {loading ? "Menganalisis..." : "Analysis Member"}
    </Button>
  )
}
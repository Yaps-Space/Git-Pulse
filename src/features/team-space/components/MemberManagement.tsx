"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function MemberManagement({ classId, members, myRole, ownerId }: any) {
  const router  = useRouter()
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
    <button onClick={analyzeAll} disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
      style={{ background: "#7B2D8B", opacity: loading ? 0.7 : 1 }}>
      {loading ? "Menganalisis..." : "🤖 Analisis Member"}
    </button>
  )
}
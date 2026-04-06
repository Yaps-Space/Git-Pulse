"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RefreshButton({ repoId, fullName }: { repoId: string, fullName: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const refresh = async () => {
    setLoading(true)
    try {
      await fetch("/api/repos/analyze", {
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
    <button onClick={refresh} disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
      style={{ background: "#F4F6F9", color: "#555", opacity: loading ? 0.7 : 1 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" className={loading ? "animate-spin" : ""}>
        <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
      </svg>
      {loading ? "Menganalisis..." : "Refresh Analysis"}
    </button>
  )
}
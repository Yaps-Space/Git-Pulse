"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function JoinTeamSpaceModal({ onClose }: { onClose: () => void }) {
  const router  = useRouter()
  const [code,    setCode]    = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  const handleJoin = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError("")
    try {
      const res  = await fetch("/api/team-space/join", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ inviteCode: code.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/team-space/${data.classId}`)
        router.refresh()
      } else {
        setError(data.error || "Kode tidak valid")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#1E3A5F" }}>Gabung Team Space</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "#333" }}>
              Kode Undangan *
            </label>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="contoh: ABC123"
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none text-center font-mono tracking-widest"
              style={{ borderColor: error ? "#F85149" : "#E0E0E0", color: "#333" }}
              maxLength={6}/>
            {error && <p className="text-xs mt-1" style={{ color: "#F85149" }}>{error}</p>}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "#F4F6F9", color: "#555" }}>
            Batal
          </button>
          <button onClick={handleJoin} disabled={loading || !code.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity"
            style={{ background: "#2E86C1", opacity: loading || !code.trim() ? 0.6 : 1 }}>
            {loading ? "Bergabung..." : "Gabung"}
          </button>
        </div>
      </div>
    </div>
  )
}
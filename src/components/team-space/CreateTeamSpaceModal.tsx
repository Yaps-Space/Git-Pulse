"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CreateTeamSpaceModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [name,        setName]        = useState("")
  const [description, setDescription] = useState("")
  const [repoFullName,setRepoFullName]= useState("")
  const [repos,       setRepos]       = useState<any[]>([])
  const [loading,     setLoading]     = useState(false)
  const [loadingRepos,setLoadingRepos]= useState(true)

  useEffect(() => {
    fetch("/api/repos/list")
      .then(r => r.json())
      .then(d => setRepos(d.repos || []))
      .finally(() => setLoadingRepos(false))
  }, [])

  const handleSubmit = async () => {
    if (!name || !repoFullName) return
    setLoading(true)
    try {
      const res = await fetch("/api/team-space", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, description, repoFullName }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/team-space/${data.id}`)
        router.refresh()
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
          <h2 className="text-xl font-bold" style={{ color: "#1E3A5F" }}>Buat Team Space</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "#333" }}>
              Nama Team Space *
            </label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="contoh: IF-A 2024"
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ borderColor: "#E0E0E0", color: "#333" }}/>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "#333" }}>
              Deskripsi (opsional)
            </label>
            <input value={description} onChange={e => setDescription(e.target.value)}
              placeholder="contoh: Kelas praktikum semester 5"
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ borderColor: "#E0E0E0", color: "#333" }}/>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "#333" }}>
              Repository *
            </label>
            {loadingRepos ? (
              <p className="text-sm" style={{ color: "#888" }}>Memuat repo...</p>
            ) : (
              <select value={repoFullName} onChange={e => setRepoFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: "#E0E0E0", color: "#333" }}>
                <option value="">Pilih repository...</option>
                {repos.map((r: any) => (
                  <option key={r.id} value={r.fullName}>{r.fullName}</option>
                ))}
              </select>
            )}
            <p className="text-xs mt-1" style={{ color: "#aaa" }}>
              Hanya repo yang sudah diconnect di Dashboard
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "#F4F6F9", color: "#555" }}>
            Batal
          </button>
          <button onClick={handleSubmit} disabled={loading || !name || !repoFullName}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity"
            style={{ background: "#2E86C1", opacity: loading || !name || !repoFullName ? 0.6 : 1 }}>
            {loading ? "Membuat..." : "Buat Team Space"}
          </button>
        </div>
      </div>
    </div>
  )
}
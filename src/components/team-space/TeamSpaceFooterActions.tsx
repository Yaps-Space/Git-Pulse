"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  classId: string
  myRole:  string
}

export default function TeamSpaceFooterActions({ classId, myRole }: Props) {
  const router  = useRouter()
  const [loading,   setLoading]   = useState(false)
  const [showConfirm, setShowConfirm] = useState<"leave" | "delete" | null>(null)

  const handleAction = async (type: "leave" | "delete") => {
    setLoading(true)
    try {
      const res = await fetch(`/api/team-space/${classId}/${type}`, { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        router.push("/team-space")
        router.refresh()
      } else {
        alert(data.error)
      }
    } finally {
      setLoading(false)
      setShowConfirm(null)
    }
  }

  return (
    <>
      <div className="flex gap-3 mt-6">
        {myRole !== "owner" && (
          <button onClick={() => setShowConfirm("leave")}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: "#FFF0F0", color: "#F85149" }}>
            Keluar dari Team Space
          </button>
        )}
        {myRole === "owner" && (
          <button onClick={() => setShowConfirm("delete")}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: "#FFF0F0", color: "#F85149" }}>
            Hapus Team Space
          </button>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2" style={{ color: "#1E3A5F" }}>
              {showConfirm === "leave" ? "Keluar dari Team Space?" : "Hapus Team Space?"}
            </h3>
            <p className="text-sm mb-6" style={{ color: "#888" }}>
              {showConfirm === "leave"
                ? "Kamu akan keluar dari Team Space ini. Aksi ini tidak bisa dibatalkan."
                : "Seluruh data Team Space dan anggota akan dihapus permanen. Aksi ini tidak bisa dibatalkan."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "#F4F6F9", color: "#555" }}>
                Batal
              </button>
              <button onClick={() => handleAction(showConfirm)} disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                style={{ background: "#F85149", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Memproses..." : "Ya, Lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/components/ui/button"
import { Trash2, LogOut, AlertTriangle } from "lucide-react"

interface Props {
  classId: string
  myRole:  string
  createdAt:  number | null
}

type ConfirmType = "leave" | "delete"

const CONFIRM_CONFIG: Record<ConfirmType, { title: string; description: string; buttonLabel: string }> = {
  leave: {
    title:       "Keluar dari Team Space?",
    description: "Kamu akan keluar dari Team Space ini. Aksi ini tidak bisa dibatalkan.",
    buttonLabel: "Ya, Keluar",
  },
  delete: {
    title:       "Hapus Team Space?",
    description: "Seluruh data Team Space dan anggota akan dihapus permanen. Aksi ini tidak bisa dibatalkan.",
    buttonLabel: "Ya, Hapus",
  },
}

export default function TeamSpaceFooterActions({ classId, myRole, createdAt }: Props) {
  const router                        = useRouter()
  const [loading,     setLoading]     = useState(false)
  const [showConfirm, setShowConfirm] = useState<ConfirmType | null>(null)

  const handleAction = async (type: ConfirmType) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/team-space/${classId}/${type}`, { method: "POST" })
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

  const confirm = showConfirm ? CONFIRM_CONFIG[showConfirm] : null
  const createdLabel = createdAt
    ? `Your team space was created on ${new Date(createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
    : "Your team space"

  return (
    <>
      <div className="bg-white rounded-2xl p-5 flex items-center justify-between border border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <LogOut className="w-4 h-4" />
          {myRole === "owner" ? createdLabel : "Kamu adalah anggota dari Team Space ini"}
        </div>

        {myRole !== "owner" && (
          <Button
            variant="ghost"
            className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => setShowConfirm("leave")}
          >
            <LogOut className="w-4 h-4" />
            Keluar dari Team Space
          </Button>
        )}
        {myRole === "owner" && (
          <Button
            className="gap-2 bg-red-500 hover:bg-red-600 text-white"
            onClick={() => setShowConfirm("delete")}
          >
            <Trash2 className="w-4 h-4" />
            Delete Team
          </Button>
        )}
      </div>

      {showConfirm && confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">{confirm.title}</h3>
              <p className="text-sm text-gray-500 text-center">{confirm.description}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" disabled={loading} onClick={() => setShowConfirm(null)}>
                Batal
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:opacity-70"
                disabled={loading}
                onClick={() => handleAction(showConfirm)}
              >
                {loading ? "Memproses..." : confirm.buttonLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
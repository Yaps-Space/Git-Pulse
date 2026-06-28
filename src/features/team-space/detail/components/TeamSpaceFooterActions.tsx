"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Trash2, LogOut, AlertTriangle } from "lucide-react"
import { ConfirmType, CONFIRM_CONFIG } from "../constants/ConfrimFooterActions"
import { deleteTeamSpace, leaveTeamSpace } from "../../services/TeamSpaceService"

interface Props {
  classId:   string
  myRole:    string
  createdAt: number | null
}

export default function TeamSpaceFooterActions({ classId, myRole, createdAt }: Props) {
  const router                        = useRouter()
  const [loading,     setLoading]     = useState(false)
  const [showConfirm, setShowConfirm] = useState<ConfirmType | null>(null)

  const handleAction = async (type: ConfirmType) => {
    setLoading(true)
    try {
      const action = type === "leave" ? leaveTeamSpace : deleteTeamSpace
      const result = await action(classId)
      if (result.ok) {
        toast.success(type === "leave" ? "Berhasil keluar dari team space." : "Team space berhasil dihapus.")
        router.push("/team-space")
        router.refresh()
      } else {
        toast.error(result.error ?? "Gagal memproses permintaan.")
      }
    } catch {
      toast.error("Tidak bisa menghubungi server.")
    } finally {
      setLoading(false)
      setShowConfirm(null)
    }
  }

  const confirm      = showConfirm ? CONFIRM_CONFIG[showConfirm] : null
  const createdLabel = createdAt
    ? `Your team space was created on ${new Date(createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
    : "Your team space"

  return (
    <>
      <div className="bg-white rounded-2xl p-5 flex items-center justify-between border border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <LogOut className="w-4 h-4" />
          {myRole === "owner" ? createdLabel : "You are a member of Team Space"}
        </div>

        {myRole !== "owner" && (
          <Button
            variant="ghost"
            className="gap-2 h-10 text-white bg-[#BB230B] hover:bg-[#A21C06]"
            onClick={() => setShowConfirm("leave")}
          >
            <LogOut className="w-4 h-4" />
            Leave Team
          </Button>
        )}
        {myRole === "owner" && (
          <Button
            className="gap-2 h-10 bg-[#BB230B] hover:bg-[#A21C06] text-white"
            onClick={() => setShowConfirm("delete")}
          >
            <Trash2 className="w-4 h-4" />
            Delete Team
          </Button>
        )}
      </div>

      <Dialog open={!!showConfirm} onOpenChange={() => setShowConfirm(null)}>
        <DialogContent className="max-w-sm">

          {confirm && (
            <>
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-[#BB230B]" />
                </div>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-center text-lg font-semibold">
                  {confirm?.title}
                </DialogTitle>
              </DialogHeader>
                <p className="text-sm text-gray-500 text-center">{confirm.description}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setShowConfirm(null)}
                  disabled={loading}
                  className="flex-1 h-10 rounded-lg text-gray-900 font-bold bg-[#CACACA] hover:bg-[#b0b0b0]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleAction(showConfirm!)}
                  disabled={loading}
                  className="flex-1 h-10 rounded-lg text-white font-bold bg-[#BB230B] hover:bg-[#A21C06] disabled:opacity-70"
                >
                  {loading ? "Memproses..." : confirm.buttonLabel}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
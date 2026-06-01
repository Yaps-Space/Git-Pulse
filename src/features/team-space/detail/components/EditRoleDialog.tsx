"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Button } from "@/shared/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { ROLE_LABEL } from "../../constants/TeamSpaceConfig"
import { canKick } from "../helpers/permissions"

const ROLES = ["owner", "evaluator", "contributor"] as const
type Role = typeof ROLES[number]
type View = "edit" | "confirm-kick"

interface Props {
  open:         boolean
  onClose:      () => void
  memberId:     string
  memberName:   string
  currentRole:  string
  myRole:       string
  classId:      string
  onKick:       () => void
  onRoleChange: (role: string) => void
}

export function EditRoleDialog({ open, onClose, memberId, memberName, currentRole, myRole, classId, onKick, onRoleChange }: Props) {
  const router                  = useRouter()
  const [view,     setView]     = useState<View>("edit")
  const [selected, setSelected] = useState<Role>(currentRole as Role)
  const [loading,  setLoading]  = useState<"save" | "kick" | null>(null)

  const isOwnerRow = currentRole === "owner"
  const showKick   = canKick(myRole, currentRole)

  const availableRoles = ROLES.filter(role => {
    if (isOwnerRow) return role === "owner"
    if (myRole === "owner") return role !== "owner"
    if (myRole === "evaluator") return role === "contributor" || role === "evaluator"
    return false
  })

  const handleClose = () => {
    setView("edit")
    onClose()
  }

  const handleSave = async () => {
    if (selected === currentRole) { handleClose(); return }
    setLoading("save")
    try {
      await fetch(`/api/team-space/${classId}/member/${memberId}/edit-role`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ role: selected }),
      })
      onRoleChange(selected)
      router.refresh()
      handleClose()
    } finally {
      setLoading(null)
    }
  }

  const handleKick = async () => {
    setLoading("kick")
    onKick()
    handleClose()
    try {
      await fetch(`/api/team-space/${classId}/member/${memberId}/kick`, { method: "POST" })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {view === "edit" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center text-lg font-semibold">
                Edit Anggota
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <p className="text-sm text-gray-700">Role</p>
                <Select
                  value={selected}
                  onValueChange={val => setSelected(val as Role)}
                  disabled={isOwnerRow || loading !== null}
                >
                  <SelectTrigger className="w-full rounded-lg !h-10 text-sm px-3 border border-input [&>span]:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABEL[role] ?? role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isOwnerRow && (
                  <p className="text-xs text-gray-400">Role owner tidak dapat diubah.</p>
                )}
              </div>

              {showKick && (
                <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Remove Anggota</p>
                    <p className="text-xs text-gray-400">Keluarkan {memberName} dari team ini</p>
                  </div>
                  <Button
                    onClick={() => setView("confirm-kick")}
                    disabled={loading !== null}
                    className="h-10 text-white bg-[#BB230B] hover:bg-[#A21C06] flex-shrink-0"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleClose}
                disabled={loading !== null}
                className="flex-1 h-10 rounded-lg text-gray-900 font-bold bg-[#CACACA] hover:bg-[#b0b0b0]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading !== null || isOwnerRow || selected === currentRole}
                className="flex-1 h-10 rounded-lg bg-[#00D964] hover:bg-[#00c057] text-gray-900 font-bold"
              >
                {loading === "save" ? "Saving..." : "Save"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[#BB230B]" />
              </div>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-center text-lg font-semibold">
                  Keluarkan Anggota
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-500 text-center">
                Apakah kamu yakin ingin mengeluarkan{" "}
                <span className="font-semibold text-gray-900">{memberName}</span>{" "}
                dari team ini?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setView("edit")}
                disabled={loading !== null}
                className="flex-1 h-10 rounded-lg text-gray-900 font-bold bg-[#CACACA] hover:bg-[#b0b0b0]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleKick}
                disabled={loading !== null}
                className="flex-1 h-10 rounded-lg text-white font-bold bg-[#BB230B] hover:bg-[#A21C06]"
              >
                {loading === "kick" ? "Removing..." : "Remove"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
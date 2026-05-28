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
import { ROLE_LABEL } from "../../constants/TeamSpaceConfig"
import { canKick } from "../helpers/permissions"

const ROLES = ["owner", "evaluator", "contributor"] as const
type Role = typeof ROLES[number]

interface Props {
  open:           boolean
  onClose:        () => void
  memberId:       string
  memberName:     string
  currentRole:    string
  myRole:         string
  classId:        string
  onKick:         () => void
  onRoleChange:   (role: string) => void
}

export function EditRoleDialog({ open, onClose, memberId, memberName, currentRole, myRole, classId, onKick, onRoleChange }: Props) {
  const router                  = useRouter()
  const [selected, setSelected] = useState<Role>(currentRole as Role)
  const [loading, setLoading]   = useState<"save" | "kick" | null>(null)

  const isOwnerRow = currentRole === "owner"
  const showKick   = canKick(myRole, currentRole)

  const availableRoles = ROLES.filter(role => {
    if (isOwnerRow) return role === "owner"
    if (myRole === "owner") return role !== "owner"
    if (myRole === "evaluator") return role === "contributor" || role === "evaluator"
    return false
  })

  const handleSave = async () => {
    if (selected === currentRole) { onClose(); return }
    setLoading("save")
    try {
      await fetch(`/api/team-space/${classId}/member/${memberId}/edit-role`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ role: selected }),
      })
      onRoleChange(selected)
      router.refresh()
      onClose()
    } finally {
      setLoading(null)
    }
  }

  const handleKick = async () => {
    setLoading("kick")
    onKick()
    onClose()
    try {
      await fetch(`/api/team-space/${classId}/member/${memberId}/kick`, { method: "POST" })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Anggota</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-gray-500">Anggota</p>
            <p className="text-sm font-medium text-gray-800">{memberName}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-gray-500">Role</p>
            <Select
              value={selected}
              onValueChange={val => setSelected(val as Role)}
              disabled={isOwnerRow || loading !== null}
            >
              <SelectTrigger className="w-full h-10 bg-white border-gray-200">
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
        </div>

        <div className="flex items-center justify-between pt-2">
          {showKick ? (
            <Button
              onClick={handleKick}
              disabled={loading !== null}
              variant="outline"
              className="h-9 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
            >
              {loading === "kick" ? "Menghapus..." : "Kick"}
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading !== null} className="h-9">
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading !== null || isOwnerRow || selected === currentRole}
              className="h-9 text-white"
              style={{ background: "#6265FE" }}
            >
              {loading === "save" ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
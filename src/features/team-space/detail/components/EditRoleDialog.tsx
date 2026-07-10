"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronDown, AlertTriangle } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Button } from "@/shared/components/ui/button"
import { ROLE_LABEL } from "../../constants/TeamSpaceConfig"
import { canKick } from "../helpers/permissions"
import { cn }   from "@/shared/lib/utils"
import { toast } from "sonner"
import { editMemberRole, kickMember } from "../../services/TeamSpaceService"

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

  useEffect(() => {
    if (open) {
      setSelected(currentRole as Role)
      setView("edit")
    }
  }, [open, currentRole])

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
      const ok = await editMemberRole(classId, memberId, selected)
      if (ok) {
        onRoleChange(selected)
        router.refresh()
        toast.success(`Role ${memberName} berhasil diubah menjadi ${ROLE_LABEL[selected] ?? selected}.`)
        handleClose()
      } else {
        toast.error("Gagal mengubah role.")
      }
    } catch {
      toast.error("Tidak bisa menghubungi server.")
    } finally {
      setLoading(null)
    }
  }

  const handleKick = async () => {
    setLoading("kick")
    onKick()
    handleClose()
    try {
      const ok = await kickMember(classId, memberId)
      if (ok) {
        router.refresh()
        toast.success(`${memberName} berhasil dikeluarkan dari tim.`)
      } else {
        toast.error("Gagal mengeluarkan member.")
      }
    } catch {
      toast.error("Tidak bisa menghubungi server.")
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
                Edit Member
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <p className="text-sm text-gray-700">Role</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      disabled={isOwnerRow || loading !== null}
                      className={cn(
                        "w-full flex items-center justify-between h-10 px-3 rounded-lg border border-input text-sm transition-colors",
                        isOwnerRow || loading !== null
                          ? "opacity-50 cursor-not-allowed bg-gray-50"
                          : "hover:bg-accent cursor-pointer"
                      )}
                    >
                      <span>{ROLE_LABEL[selected] ?? selected}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                    {availableRoles.map(role => (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => setSelected(role)}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "w-4 h-4 flex-shrink-0",
                            selected === role ? "opacity-100 text-[#00D964]" : "opacity-0"
                          )}
                        />
                        {ROLE_LABEL[role] ?? role}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {isOwnerRow && (
                  <p className="text-xs text-gray-400">The Owner role cannot be changed.</p>
                )}
              </div>

              {showKick && (
                <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Remove Member</p>
                    <p className="text-xs text-gray-400">Remove {memberName} from this team</p>
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
                  Remove Member
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-500 text-center">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-gray-900">{memberName}</span>{" "}
                from this team?
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
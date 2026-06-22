"use client"

import { useState } from "react"
import { Edit2, BarChart2 } from "lucide-react"
import { canManageMembers } from "../helpers/permissions"
import { EditRoleDialog }   from "./EditRoleDialog"

interface Props {
  memberId:     string
  memberName:   string
  memberStatus: string
  currentRole:  string
  myRole:       string
  classId:      string
  onAnalyze:    () => void
  onKick:       () => void
  onRoleChange: (role: string) => void
}

export default function MemberActions({
  memberId, memberName, memberStatus, currentRole,
  myRole, classId, onAnalyze, onKick, onRoleChange,
}: Props) {
  const [loading,  setLoading]  = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const showEdit      = canManageMembers(myRole)
  const cannotAnalyze = memberStatus === "not_joined" || loading === "analyze"

  const handleAnalyze = async () => {
    if (cannotAnalyze) return
    onAnalyze()
    setLoading("analyze")
    try {
      await fetch(`/api/team-space/${classId}/member/${memberId}/analyze`, { method: "POST" })
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        {showEdit && (
          <button
            onClick={() => setEditOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-[#83ECA7] hover:bg-[#00D964] text-gray-900 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={handleAnalyze}
          disabled={cannotAnalyze}
          className="w-8 h-8 flex items-center justify-center rounded-md bg-[#00D964] hover:bg-[#00b853] text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <BarChart2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {showEdit && (
        <EditRoleDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          memberId={memberId}
          memberName={memberName}
          currentRole={currentRole}
          myRole={myRole}
          classId={classId}
          onKick={onKick}
          onRoleChange={onRoleChange}
        />
      )}
    </>
  )
}
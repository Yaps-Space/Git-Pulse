"use client"

import { useState } from "react"
import { Edit2, BarChart2 } from "lucide-react"
import { canManageMembers } from "../helpers/permissions"
import { EditRoleDialog }   from "./EditRoleDialog"

interface Props {
  memberId:      string
  memberName:    string
  currentRole:   string
  myRole:        string
  classId:       string
  onAnalyze:     () => void
  onKick:        () => void
  onRoleChange:  (role: string) => void
}

export default function MemberActions({ memberId, memberName, currentRole, myRole, classId, onAnalyze, onKick, onRoleChange }: Props) {
  const [loading, setLoading]   = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const showEdit = canManageMembers(myRole)

  const handleAnalyze = async () => {
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
      <div className="flex items-center gap-2">
        {showEdit && (
          <button
            onClick={() => setEditOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={handleAnalyze}
          disabled={loading === "analyze"}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-[#00D964] hover:text-[#00b853] hover:border-[#00D964] transition-colors disabled:opacity-50"
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
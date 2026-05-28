"use client"

import Image from "next/image"
import { useState } from "react"
import { Edit2, BarChart2 } from "lucide-react"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL } from "../../constants/TeamSpaceConfig"
import { STATUS_COLOR, STATUS_LABEL }        from "../constants/TeamSpaceDetail"
import { canManageMembers }                  from "../helpers/permissions"
import { EditRoleDialog }                    from "./EditRoleDialog"
import { TeamMember }                        from "../../types/TeamSpace"

interface Props {
  member:       TeamMember
  myRole:       string
  classId:      string
  onAnalyze:    () => void
  onKick:       () => void
  onRoleChange: (role: string) => void
}

export function TeamSpaceMemberCard({ member, myRole, classId, onAnalyze, onKick, onRoleChange }: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const showEdit                = canManageMembers(myRole)

  const handleAnalyze = async () => {
    onAnalyze()
    setLoading(true)
    try {
      await fetch(`/api/team-space/${classId}/member/${member.id}/analyze`, { method: "POST" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {member.userImage && (
              <Image src={member.userImage} alt={member.userName} width={36} height={36} className="rounded-full object-cover flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{member.userName}</p>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-0.5"
                style={{ background: ROLE_COLOR[member.role] ?? "#eee", color: ROLE_TEXT[member.role] ?? "#333" }}
              >
                <span className="w-1 h-1 rounded-full" style={{ background: ROLE_TEXT[member.role] ?? "#333" }} />
                {ROLE_LABEL[member.role] ?? member.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
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
              disabled={loading}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-[#00D964] hover:border-[#00D964] transition-colors disabled:opacity-50"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400">Frekuensi Commits</span>
            <span className="text-xs font-semibold text-gray-700">{member.commitVelocity.toFixed(1)} / hari</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400">Kontribusi</span>
            <span className="text-xs font-semibold text-gray-700">{(member.contributionShare * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Status</span>
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              background: (STATUS_COLOR[member.status] ?? "#888") + "18",
              color:      STATUS_COLOR[member.status] ?? "#888",
            }}
          >
            {member.status === "analyzing" ? (
              <span className="w-2 h-2 rounded-full border border-current border-t-transparent animate-spin" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[member.status] ?? "#888" }} />
            )}
            {STATUS_LABEL[member.status] ?? member.status}
          </span>
        </div>
      </div>

      {showEdit && (
        <EditRoleDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          memberId={member.id}
          memberName={member.userName}
          currentRole={member.role}
          myRole={myRole}
          classId={classId}
          onKick={onKick}
          onRoleChange={onRoleChange}
        />
      )}
    </>
  )
}
"use client"

import Image from "next/image"
import { useState } from "react"
import { Edit2, BarChart2 } from "lucide-react"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL }      from "../../constants/TeamSpaceConfig"
import { CONSISTENCY_LABEL, STATUS_COLOR, STATUS_LABEL } from "../constants/TeamSpaceDetail"
import { canManageMembers }                        from "../helpers/permissions"
import { EditRoleDialog }                          from "./EditRoleDialog"
import { TeamMember }                              from "../../types/TeamSpace"
import { capitalizeFirst }                         from "@/shared/helpers"

interface Props {
  member:       TeamMember
  index:        number
  myRole:       string
  classId:      string
  onAnalyze:    () => void
  onKick:       () => void
  onRoleChange: (role: string) => void
}

export function TeamSpaceMemberCard({ member, index, myRole, classId, onAnalyze, onKick, onRoleChange }: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [loading,  setLoading]  = useState(false)

  const showEdit      = canManageMembers(myRole)
  const cannotAnalyze = member.status === "not_joined"
  const displayName   = member.displayName ?? member.userName

  const handleAnalyze = async () => {
    if (cannotAnalyze) return
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
      <div className="bg-gray-50 rounded-xl p-5 flex flex-col gap-3 border border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-bold text-gray-900 flex-shrink-0">{index}.</span>
            {member.userImage ? (
              <Image
                src={member.userImage}
                alt={displayName}
                width={36}
                height={36}
                className="rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-gray-500">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{displayName}</p>
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                  style={{ background: ROLE_COLOR[member.role] ?? "#eee", color: ROLE_TEXT[member.role] ?? "#333" }}
                >
                  <span className="w-1 h-1 rounded-full" style={{ background: ROLE_TEXT[member.role] ?? "#333" }} />
                  {ROLE_LABEL[member.role] ?? member.role}
                </span>
              </div>
              {member.userLogin && (
                <p className="text-xs text-gray-400">@{member.userLogin}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
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
              disabled={loading || cannotAnalyze}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-[#00D964] hover:bg-[#00b853] text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Frekuensi Commits</span>
            <span className="text-xs font-semibold text-gray-700">{member.commitVelocity.toFixed(1)} / hari</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Kontribusi</span>
            <span className="text-xs font-semibold text-gray-700">{(member.contributionShare * 100).toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Konsistensi</span>
            <span className="text-xs font-semibold text-gray-700">{CONSISTENCY_LABEL(member.activityConsistency)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Active Weeks</span>
            <span className="text-xs font-semibold text-gray-700">{Math.round(member.activeWeeksRatio * 100)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Status</span>
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium"
              style={{ background: STATUS_COLOR[capitalizeFirst(member.status)] ?? "#888" }}
            >
              {member.status === "analyzing" && (
                <span className="w-2 h-2 rounded-full border border-current border-t-transparent animate-spin" />
              )}
              {STATUS_LABEL[capitalizeFirst(member.status)] ?? capitalizeFirst(member.status)}
            </span>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditRoleDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          memberId={member.id}
          memberName={displayName}
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
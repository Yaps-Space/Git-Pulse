"use client"

import { useState } from "react"
import { Users, GitBranch, Pencil } from "lucide-react"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL } from "../../constants/TeamSpaceConfig"
import { InviteCodeButton } from "./InviteCodeButton"
import { QRButton }         from "./QRButton"
import { TeamSpaceDetail }  from "../types/TeamSpaceDetail"
import { EditTeamSpaceModal } from "./EditTeamSpaceModal"

interface Props {
  detail:      TeamSpaceDetail
  isEvaluator: boolean
  isOwner:     boolean
  onMutate:    (fn: (data: TeamSpaceDetail) => TeamSpaceDetail) => void
}

export function TeamSpaceHeader({ detail, isEvaluator, isOwner, onMutate }: Props) {
  const [showEdit, setShowEdit] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-gray-900">{detail.name}</h2>
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0"
              style={{
                background: ROLE_COLOR[detail.myRole] ?? "#eee",
                color:      ROLE_TEXT[detail.myRole]  ?? "#333",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: ROLE_TEXT[detail.myRole] ?? "#333" }}
              />
              {ROLE_LABEL[detail.myRole] ?? detail.myRole}
            </span>
          </div>

          {detail.description && (
            <p className="text-sm text-gray-500 mt-0.5">{detail.description}</p>
          )}

          <div className="flex items-center gap-1.5 mt-2">
            <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-400">{detail.members.length} Anggota</span>
          </div>

          <div className="flex items-start gap-1.5 mt-0.5">
            <GitBranch className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-x-2 gap-y-0.5">
              {detail.repoFullNames.map((name, i) => (
                <span key={i} className="text-xs text-gray-400">
                  {name}{i < detail.repoFullNames.length - 1 ? "," : ""}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isOwner && (
            <button
              onClick={() => setShowEdit(true)}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {isEvaluator && (
            <>
              <InviteCodeButton inviteCode={detail.inviteCode} className="h-10" />
              <QRButton inviteCode={detail.inviteCode} teamName={detail.name} className="h-10" />
            </>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 mt-4 pt-4 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-gray-400 tracking-wider">Dosen PM</span>
          <span className="text-sm font-semibold text-gray-800">{detail.projectManager ?? "-"}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-gray-400 tracking-wider">Program Studi</span>
          <span className="text-sm font-semibold text-gray-800">{detail.studyProgram ?? "-"}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-gray-400 tracking-wider">Tahun Ajaran</span>
          <span className="text-sm font-semibold text-gray-800">{detail.academicYear ?? "-"}</span>
        </div>
      </div>

      {showEdit && (
        <EditTeamSpaceModal
          detail={detail}
          onClose={() => setShowEdit(false)}
          onSaved={updated => onMutate(() => updated)}
        />
      )}
    </div>
  )
}
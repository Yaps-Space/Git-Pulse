"use client"

import { useState } from "react"
import { Users, GitBranch, Pencil } from "lucide-react"
import { MobilePageHeader }  from "@/shared/components/commons/MobilePageHeader"
import { InviteCodeButton }  from "./InviteCodeButton"
import { QRButton }          from "./QRButton"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL } from "../../constants/TeamSpaceConfig"
import { TeamSpaceDetail }   from "../types/TeamSpaceDetail"
import { EditTeamSpaceModal } from "./EditTeamSpaceModal"

interface Props {
  detail:      TeamSpaceDetail
  isEvaluator: boolean
  isOwner:     boolean
  onMutate:    (fn: (data: TeamSpaceDetail) => TeamSpaceDetail) => void
}

export function TeamSpaceHeaderMobile({ detail, isEvaluator, isOwner, onMutate }: Props) {
  const [showEdit, setShowEdit] = useState(false)

  return (
    <>
      <MobilePageHeader title={detail.name} backHref="/team-space">
        <div className="flex flex-col gap-1.5">
          {detail.description && (
            <p className="text-xs text-gray-400 truncate">{detail.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">{detail.members.length} Anggota</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isOwner && (
                <button
                  onClick={() => setShowEdit(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
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
          </div>
          <div className="flex items-start gap-1 min-w-0">
            <GitBranch className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 min-w-0">
              {detail.repoFullNames.map((name, i) => (
                <span key={i} className="text-xs text-gray-400 truncate max-w-[200px]">
                  {name}{i < detail.repoFullNames.length - 1 ? "," : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      </MobilePageHeader>

      <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-gray-400 tracking-wider">Dosen PM</span>
          <span className="text-xs font-semibold text-gray-800 truncate">{detail.projectManager ?? "-"}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-gray-400 tracking-wider">Program Studi</span>
          <span className="text-xs font-semibold text-gray-800 truncate">{detail.studyProgram ?? "-"}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-gray-400 tracking-wider">Tahun Ajaran</span>
          <span className="text-xs font-semibold text-gray-800">{detail.academicYear ?? "-"}</span>
        </div>
      </div>

      {isEvaluator && (
        <div className="flex gap-2 mx-4 mt-3">
          <InviteCodeButton inviteCode={detail.inviteCode} className="flex-1 h-10 justify-center" />
          <QRButton inviteCode={detail.inviteCode} teamName={detail.name} className="flex-1 h-10 justify-center" />
        </div>
      )}

      {showEdit && (
        <EditTeamSpaceModal
          detail={detail}
          onClose={() => setShowEdit(false)}
          onSaved={updated => onMutate(() => updated)}
        />
      )}
    </>
  )
}
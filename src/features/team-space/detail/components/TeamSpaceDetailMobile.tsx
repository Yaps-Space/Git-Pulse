"use client"

import { Users, GitBranch } from "lucide-react"
import { MobilePageHeader }        from "@/shared/components/commons/MobilePageHeader"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL } from "../../constants/TeamSpaceConfig"
import { canViewAllMembers }       from "../helpers/permissions"
import { InviteCodeButton }        from "./InviteCodeButton"
import { QRButton }                from "./QRButton"
import { TeamSpaceStatusCards }    from "./TeamSpaceStatusCards"
import { TeamSpaceMemberList }     from "./TeamSpaceMemberList"
import { TeamSpaceContribution }   from "./TeamSpaceContribution"
import { ContributorsChart }       from "./ContributorsChart"
import TeamSpaceFooterActions      from "./TeamSpaceFooterActions"
import { TeamSpaceDetail }         from "../types/TeamSpaceDetail"

interface Props {
  detail:   TeamSpaceDetail
  onMutate: (fn: (data: TeamSpaceDetail) => TeamSpaceDetail) => void
}

export function TeamSpaceDetailMobile({ detail, onMutate }: Props) {
  const isEvaluator = canViewAllMembers(detail.myRole)

  return (
    <div className="min-h-screen">
      <MobilePageHeader title={detail.name} backHref="/team-space">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: ROLE_COLOR[detail.myRole] ?? "#eee", color: ROLE_TEXT[detail.myRole] ?? "#333" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_TEXT[detail.myRole] ?? "#333" }} />
              {ROLE_LABEL[detail.myRole] ?? detail.myRole}
            </span>
          </div>
          {detail.description && (
            <p className="text-xs text-gray-400 truncate">{detail.description}</p>
          )}
          <div className="flex items-center gap-3 mt-0.5">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">{detail.members.length} Anggota</span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <GitBranch className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-400 truncate">{detail.repoFullName}</span>
            </div>
          </div>
        </div>
      </MobilePageHeader>

      <div className="px-4 pt-5 pb-6 flex flex-col gap-4">
        {isEvaluator && (
          <div className="flex gap-2">
            <InviteCodeButton inviteCode={detail.inviteCode} className="flex-1 h-10 justify-center" />
            <QRButton inviteCode={detail.inviteCode} teamName={detail.name} className="h-10" />
          </div>
        )}

        {isEvaluator ? (
          <>
            <TeamSpaceStatusCards members={detail.members} />
            <TeamSpaceMemberList
              members={detail.members}
              myRole={detail.myRole}
              classId={detail.id}
              onMutate={onMutate}
            />
            <ContributorsChart
              members={detail.members}
              repoCommitsPerMonth={detail.repoCommitsPerMonth ?? Array(12).fill(0)}
            />
          </>
        ) : (
          <TeamSpaceContribution membership={detail.myMembership} />
        )}

        <TeamSpaceFooterActions
          classId={detail.id}
          myRole={detail.myRole}
          createdAt={detail.createdAt}
        />
      </div>
    </div>
  )
}
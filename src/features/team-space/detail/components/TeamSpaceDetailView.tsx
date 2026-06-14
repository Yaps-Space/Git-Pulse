"use client"

import { Users, GitBranch } from "lucide-react"
import { useTeamSpaceDetail } from "../hooks/useTeamSpaceDetail"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL } from "../../constants/TeamSpaceConfig"
import { canViewAllMembers }       from "../helpers/permissions"
import { InviteCodeButton }        from "./InviteCodeButton"
import { QRButton }                from "./QRButton"
import { TeamSpaceStatusCards }    from "./TeamSpaceStatusCards"
import { TeamSpaceMemberTable }    from "./TeamSpaceMemberTable"
import { ContributorsChart }       from "./ContributorsChart"
import TeamSpaceFooterActions      from "./TeamSpaceFooterActions"
import { TeamSpaceRepoHealthCard } from "./TeamSpaceRepoHealthCard"

interface Props {
  id: string
}

export default function TeamSpaceDetailView({ id }: Props) {
  const { detail, refresh } = useTeamSpaceDetail(id)

  if (!detail) return null

  const isEvaluator    = canViewAllMembers(detail.myRole)
  const visibleMembers = isEvaluator
    ? detail.members
    : detail.members.filter(m => m.userId === detail.myMembership.userId)

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">{detail.name}</h2>
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
              style={{ background: ROLE_COLOR[detail.myRole] ?? "#eee", color: ROLE_TEXT[detail.myRole] ?? "#333" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_TEXT[detail.myRole] ?? "#333" }} />
              {ROLE_LABEL[detail.myRole] ?? detail.myRole}
            </span>
          </div>
          {detail.description && (
            <p className="text-sm text-gray-500">{detail.description}</p>
          )}
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-400">{detail.members.length} Anggota</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-400">{detail.repoFullName}</span>
            </div>
          </div>
        </div>

        {isEvaluator && (
          <div className="flex items-center gap-2">
            <InviteCodeButton inviteCode={detail.inviteCode} className="h-10" />
            <QRButton inviteCode={detail.inviteCode} teamName={detail.name} className="h-10" />
          </div>
        )}
      </div>

      {/* Repo Health Stats */}
      <div className="mt-4 mb-2"> 
        <TeamSpaceRepoHealthCard
          healthScore       ={detail.healthScore}
          healthGrade       ={detail.healthGrade}
          productivityState ={detail.productivityState}
          repoFullName      ={detail.repoFullName}
          repoId            ={detail.repoId}
        />
      </div>

      {isEvaluator && (
        <div className="mb-4">
         <TeamSpaceStatusCards members={detail.members} />
        </div>
      )}

      <div className="mb-4">
        <TeamSpaceMemberTable
          members={visibleMembers}
          myRole={detail.myRole}
          ownerId={detail.ownerId}
          classId={detail.id}
          onMutate={refresh}
          showSearchAndFilter={isEvaluator}
        />
      </div>

      <ContributorsChart members={visibleMembers} repoCommitsPerMonth={detail.repoCommitsPerMonth} />

      <div className="mt-4">
        <TeamSpaceFooterActions
          classId={detail.id}
          myRole={detail.myRole}
          createdAt={detail.createdAt}
        />
      </div>
    </div>
  )
}
"use client"

import { Users, GitBranch } from "lucide-react"
import { useTeamSpaceDetail }      from "../hooks/useTeamSpaceDetail"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL } from "../../constants/TeamSpaceConfig"
import { canViewAllMembers }       from "../helpers/permissions"
import { InviteCodeButton }        from "./InviteCodeButton"
import { QRButton }                from "./QRButton"
import { TeamSpaceStatusCards }    from "./TeamSpaceStatusCards"
import { TeamSpaceMemberTable }    from "./TeamSpaceMemberTable"
import { ContributorsChart }       from "./ContributorsChart"
import TeamSpaceFooterActions      from "./TeamSpaceFooterActions"
import { TeamSpaceRepoHealthCard } from "./TeamSpaceRepoHealthCard"
import { ContributionCard }      from "./ContributionCard"

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
    <div className="flex flex-col gap-4">
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
            <div className="flex items-center gap-1.5 flex-wrap">
              <GitBranch className="w-3.5 h-3.5 text-gray-400" />
              {detail.repoFullNames.map((name, i) => (
                <span key={i} className="text-xs text-gray-400">{name}{i < detail.repoFullNames.length - 1 ? "," : ""}</span>
              ))}
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

      {/* Repo Health Stats — satu card per repo */}
      <div className="flex flex-col gap-2">
        {detail.repoHealthList.map((rh) => (
          <TeamSpaceRepoHealthCard
            key={rh.repoFullName}
            healthScore       ={rh.healthScore}
            healthGrade       ={rh.healthGrade}
            productivityState ={rh.productivityState}
            repoFullName      ={rh.repoFullName}
            repoId            ={rh.repoId}
          />
        ))}
        {isEvaluator && (
          <TeamSpaceStatusCards members={detail.members} />
        )}
      </div>

      {isEvaluator ? (
        <TeamSpaceMemberTable
          members={visibleMembers}
          myRole={detail.myRole}
          ownerId={detail.ownerId}
          classId={detail.id}
          onMutate={refresh}
          showSearchAndFilter={isEvaluator}
        />
      ) : (
        <ContributionCard member={detail.myMembership} classId={detail.id} onMutate={refresh} />
      )}

      <ContributorsChart members={visibleMembers} repoCommitsPerMonth={detail.repoCommitsPerMonth} />

      <TeamSpaceFooterActions
        classId={detail.id}
        myRole={detail.myRole}
        createdAt={detail.createdAt}
      />
    </div>
  )
}
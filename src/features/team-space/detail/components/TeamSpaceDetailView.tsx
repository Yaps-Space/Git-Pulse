"use client"

import { useTeamSpaceDetail }      from "../hooks/useTeamSpaceDetail"
import { canViewAllMembers }       from "../helpers/permissions"
import { TeamSpaceHeader }         from "./TeamSpaceHeader"
import { TeamSpaceRepoTabs }       from "./TeamSpaceRepoTabs"
import TeamSpaceFooterActions      from "./TeamSpaceFooterActions"

interface Props {
  id: string
}

export default function TeamSpaceDetailView({ id }: Props) {
  const { detail, refresh } = useTeamSpaceDetail(id)

  if (!detail) return null

  const isEvaluator    = canViewAllMembers(detail.myRole)
  const isOwner        = detail.myRole === "owner"
  const visibleMembers = isEvaluator
    ? detail.members
    : detail.members.filter(m => m.userId === detail.myMembership.userId)

  return (
    <div className="flex flex-col gap-4">
      <TeamSpaceHeader
        detail={detail}
        isEvaluator={isEvaluator}
        isOwner={isOwner}
        onMutate={refresh}
      />

      <TeamSpaceRepoTabs
        repoHealthList={detail.repoHealthList}
        repoCommitsPerMonth={detail.repoCommitsPerMonth}
        members={visibleMembers}
        myMembership={detail.myMembership}
        myRole={detail.myRole}
        ownerId={detail.ownerId}
        classId={detail.id}
        teamSpaceName={detail.name}
        isEvaluator={isEvaluator}
        onMutate={refresh}
      />

      <TeamSpaceFooterActions
        classId={detail.id}
        myRole={detail.myRole}
        createdAt={detail.createdAt}
      />
    </div>
  )
}
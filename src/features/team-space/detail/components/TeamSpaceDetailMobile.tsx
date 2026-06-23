"use client"

import { canViewAllMembers }         from "../helpers/permissions"
import { TeamSpaceHeaderMobile }     from "./TeamSpaceHeaderMobile"
import { TeamSpaceRepoTabsMobile }   from "./TeamSpaceRepoTabsMobile"
import { ContributionCard }          from "./ContributionCard"
import TeamSpaceFooterActions        from "./TeamSpaceFooterActions"
import { TeamSpaceDetail }           from "../types/TeamSpaceDetail"

interface Props {
  detail:   TeamSpaceDetail
  onMutate: (fn: (data: TeamSpaceDetail) => TeamSpaceDetail) => void
}

export function TeamSpaceDetailMobile({ detail, onMutate }: Props) {
  const isEvaluator    = canViewAllMembers(detail.myRole)
  const isOwner        = detail.myRole === "owner"
  const visibleMembers = isEvaluator
    ? detail.members
    : detail.members.filter(m => m.userId === detail.myMembership.userId)

  return (
    <div className="min-h-screen">
      <TeamSpaceHeaderMobile
        detail={detail}
        isEvaluator={isEvaluator}
        isOwner={isOwner}
        onMutate={onMutate}
      />

      <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
        <TeamSpaceRepoTabsMobile
          repoHealthList={detail.repoHealthList}
          repoCommitsPerMonth={detail.repoCommitsPerMonth}
          members={visibleMembers}
          myRole={detail.myRole}
          classId={detail.id}
          isEvaluator={isEvaluator}
          onMutate={onMutate}
        />

        {!isEvaluator && (
          <ContributionCard
            member={detail.myMembership}
            classId={detail.id}
            onMutate={onMutate}
          />
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
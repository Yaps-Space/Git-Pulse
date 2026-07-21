"use client"

import { useState } from "react"
import { cn } from "@/shared/lib/utils"
import { useIsMobile } from "@/shared/hooks/UseMobile"
import { TeamSpaceRepoHealthCard } from "./TeamSpaceRepoHealthCard"
import { TeamSpaceStatusCards }    from "./TeamSpaceStatusCards"
import { TeamSpaceMemberList }     from "./TeamSpaceMemberList"
import { TeamSpaceMemberTable }    from "./TeamSpaceMemberTable"
import { ContributorsChart }       from "./ContributorsChart"
import { ContributionCard }        from "./ContributionCard"
import { TeamMember } from "../../types/TeamSpace"
import { RepoHealth, TeamSpaceDetail } from "../types/TeamSpaceDetail"

interface Props {
  repoHealthList:      RepoHealth[]
  repoCommitsPerMonth: Record<string, number[]>
  members:             TeamMember[]
  myMembership:        TeamMember
  myRole:              string
  ownerId?:            string
  classId:             string
  teamSpaceName:       string
  isEvaluator:         boolean
  onMutate:            (fn: (data: TeamSpaceDetail) => TeamSpaceDetail) => void
}

function memberHasRepoActivity(member: TeamMember, repoFullName: string): boolean {
  if (member.statusByRepo?.[repoFullName]) return true
  const monthly = member.commitsPerMonthByRepo?.[repoFullName] ?? []
  return monthly.some(c => c > 0)
}

export function TeamSpaceRepoTabs({
  repoHealthList,
  repoCommitsPerMonth,
  members,
  myMembership,
  myRole,
  ownerId,
  classId,
  teamSpaceName,
  isEvaluator,
  onMutate,
}: Props) {
  const isMobile                   = useIsMobile()
  const [activeTab, setActiveTab]  = useState(0)

  const activeRepo    = repoHealthList[activeTab]
  const activeCommits = activeRepo
    ? { [activeRepo.repoFullName]: repoCommitsPerMonth[activeRepo.repoFullName] ?? Array(12).fill(0) }
    : {}

  const canViewActiveRepoDetail = activeRepo
    ? isEvaluator || memberHasRepoActivity(myMembership, activeRepo.repoFullName)
    : false

  const activeMembers = activeRepo
    ? members.map(m => {
        const isAnalyzing = m.status === "analyzing"
        return {
          ...m,
          commitsPerMonth:       m.commitsPerMonthByRepo?.[activeRepo.repoFullName] ?? Array(12).fill(0),
          commitVelocity:        isAnalyzing ? m.commitVelocity : (m.commitVelocityByRepo?.[activeRepo.repoFullName] ?? 0),
          contributionShare:     isAnalyzing ? m.contributionShare : (m.contributionShareByRepo?.[activeRepo.repoFullName] ?? 0),
          activityConsistency:   isAnalyzing ? m.activityConsistency : (m.activityConsistencyByRepo?.[activeRepo.repoFullName] ?? 0),
          activeWeeksRatio:      isAnalyzing ? m.activeWeeksRatio : (m.activeWeeksRatioByRepo?.[activeRepo.repoFullName] ?? 0),
          status:                isAnalyzing ? m.status : (m.statusByRepo?.[activeRepo.repoFullName] ?? m.status),
          recommendation:        isAnalyzing ? m.recommendation : (m.recommendationByRepo?.[activeRepo.repoFullName] ?? m.recommendation),
        }
      })
    : members

  const shortName = (fullName: string) => fullName.split("/").pop() ?? fullName

  return (
    <div className={cn("flex flex-col", isMobile ? "gap-3" : "gap-4")}>
      {repoHealthList.length > 1 && (
        <div className="border-b border-gray-300">
          <div className={cn("flex items-center", isMobile ? "gap-5" : "gap-6")}>
            {repoHealthList.map((rh, i) => (
              <button
                key={rh.repoFullName}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "pb-1 text-sm font-medium transition-colors border-b-2 -mb-px",
                  isMobile && "truncate max-w-[140px]",
                  activeTab === i
                    ? "border-[#00D964] text-gray-900 font-semibold"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                )}
              >
                {shortName(rh.repoFullName)}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeRepo && (
        <TeamSpaceRepoHealthCard
          healthScore={activeRepo.healthScore}
          healthGrade={activeRepo.healthGrade}
          productivityState={activeRepo.productivityState}
          repoFullName={activeRepo.repoFullName}
          repoId={activeRepo.repoId}
          viewerRepoId={activeRepo.viewerRepoId}
          provider={activeRepo.provider}
          teamSpaceId={classId}
          teamSpaceName={teamSpaceName}
          canViewDetail={canViewActiveRepoDetail}
        />
      )}

      {!isEvaluator && (
        <ContributionCard
          member={myMembership}
          classId={classId}
          onMutate={onMutate}
        />
      )}

      {isEvaluator && <TeamSpaceStatusCards members={activeMembers} />}

      {isEvaluator && (
        isMobile ? (
          <TeamSpaceMemberList
            members={activeMembers}
            myRole={myRole}
            classId={classId}
            onMutate={onMutate}
            showSearchAndFilter={true}
          />
        ) : (
          <TeamSpaceMemberTable
            members={activeMembers}
            myRole={myRole}
            ownerId={ownerId ?? ""}
            classId={classId}
            onMutate={onMutate}
            showSearchAndFilter={true}
          />
        )
      )}

      <ContributorsChart
        members={activeMembers}
        repoCommitsPerMonth={activeCommits}
      />
    </div>
  )
}
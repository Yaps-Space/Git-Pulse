"use client"

import { useState } from "react"
import { cn }                        from "@/shared/lib/utils"
import { TeamSpaceRepoHealthCard }   from "./TeamSpaceRepoHealthCard"
import { TeamSpaceStatusCards }      from "./TeamSpaceStatusCards"
import { TeamSpaceMemberTable }      from "./TeamSpaceMemberTable"
import { ContributorsChart }         from "./ContributorsChart"
import { TeamMember }                from "../../types/TeamSpace"
import { RepoHealth, TeamSpaceDetail } from "../types/TeamSpaceDetail"

interface Props {
  repoHealthList:      RepoHealth[]
  repoCommitsPerMonth: Record<string, number[]>
  members:             TeamMember[]
  myRole:              string
  ownerId:             string
  classId:             string
  isEvaluator:         boolean
  onMutate:            (optimisticFn: (data: TeamSpaceDetail) => TeamSpaceDetail) => void
}

export function TeamSpaceRepoTabs({
  repoHealthList,
  repoCommitsPerMonth,
  members,
  myRole,
  ownerId,
  classId,
  isEvaluator,
  onMutate,
}: Props) {
  const [activeTab, setActiveTab] = useState(0)

  const activeRepo    = repoHealthList[activeTab]
  const activeCommits = activeRepo
    ? { [activeRepo.repoFullName]: repoCommitsPerMonth[activeRepo.repoFullName] ?? Array(12).fill(0) }
    : {}

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
    <div className="flex flex-col gap-4">
      {repoHealthList.length > 1 && (
        <div className="border-b border-gray-300">
          <div className="flex items-center gap-6">
            {repoHealthList.map((rh, i) => (
              <button
                key={rh.repoFullName}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "pb-1 text-sm font-medium transition-colors border-b-2 -mb-px",
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
        />
      )}

      {isEvaluator && <TeamSpaceStatusCards members={activeMembers} />}

      {isEvaluator && (
        <TeamSpaceMemberTable
          members={activeMembers}
          myRole={myRole}
          ownerId={ownerId}
          classId={classId}
          onMutate={onMutate}
          showSearchAndFilter={true}
        />
      )}

      <ContributorsChart
        members={activeMembers}
        repoCommitsPerMonth={activeCommits}
      />
    </div>
  )
}
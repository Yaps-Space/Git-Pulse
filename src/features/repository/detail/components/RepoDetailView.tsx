"use client"

import { RepoDetailHeader }     from "./RepoDetailHeader"
import { RepoProductivityCard } from "./RepoProductivityCard"
import { RepoHealthCard }       from "./RepoHealthCard"
import { RepoRecommendations }  from "./RepoRecommendations"
import { RepoTeamSpaceCard }    from "./RepoTeamSpaceCard"
import { RepoDetail }           from "../types/RepoDetail"
import { useRefreshRepo }       from "../hooks/useRefreshRepo"

interface Props {
  repo:        RepoDetail
  teamSpaceId?: string
}

export function RepoDetailView({ repo, teamSpaceId }: Props) {
  const { loading, refresh } = useRefreshRepo(repo.id, teamSpaceId)

  return (
    <div className="flex flex-col gap-4">
      <RepoDetailHeader repo={repo} refreshing={loading} onRefresh={refresh} />

      <div className="grid grid-cols-2 gap-4">
        <RepoProductivityCard repo={repo} refreshing={loading} />
        <RepoHealthCard       repo={repo} refreshing={loading} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <RepoRecommendations recommendations={repo.healthRecommendations} refreshing={loading} />
        <RepoTeamSpaceCard repoFullName={repo.fullName} />
      </div>
    </div>
  )
}
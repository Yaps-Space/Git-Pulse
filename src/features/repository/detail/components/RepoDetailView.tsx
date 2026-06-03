"use client"

import { RepoDetailHeader }     from "./RepoDetailHeader"
import { RepoProductivityCard } from "./RepoProductivityCard"
import { RepoHealthCard }       from "./RepoHealthCard"
import { RepoRecommendations }  from "./RepoRecommendations"
import { RepoTeamSpaceCard }    from "./RepoTeamSpaceCard"
import { RepoDetail }           from "../types/RepoDetail"
import { useRefreshRepo }       from "../hooks/useRefreshRepo"

interface Props {
  repo: RepoDetail
}

export function RepoDetailView({ repo }: Props) {
  const { loading, refresh } = useRefreshRepo(repo.id)

  return (
    <div className="flex flex-col gap-4">
      <RepoDetailHeader repo={repo} refreshing={loading} onRefresh={refresh} />

      <div className="grid grid-cols-2 gap-4">
        <RepoProductivityCard repo={repo} refreshing={loading} />
        <RepoHealthCard       repo={repo} refreshing={loading} />
      </div>

      <RepoRecommendations recommendations={repo.healthRecommendations} refreshing={loading} />
      <RepoTeamSpaceCard repoFullName={repo.fullName} />
    </div>
  )
}
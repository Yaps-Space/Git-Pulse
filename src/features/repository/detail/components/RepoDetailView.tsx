"use client"

import { RepoDetailHeader }     from "./RepoDetailHeader"
import { RepoProductivityCard } from "./RepoProductivityCard"
import { RepoHealthCard }       from "./RepoHealthCard"
import { RepoRecommendations } from "./RepoRecommendations"
import { RepoDetail } from "../types/RepoDetail"

interface Props {
  repo: RepoDetail
}

export function RepoDetailView({ repo }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <RepoDetailHeader repo={repo} />

      <div className="grid grid-cols-2 gap-4">
        <RepoProductivityCard repo={repo} />
        <RepoHealthCard       repo={repo} />
      </div>

      <RepoRecommendations recommendations={repo.healthRecommendations} />
    </div>
  )
}
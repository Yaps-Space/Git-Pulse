"use client"

import { Star, GitFork, Clock } from "lucide-react"
import { MobilePageHeader }     from "@/shared/components/commons/MobilePageHeader"
import { RepoProductivityCard } from "./RepoProductivityCard"
import { RepoHealthCard }       from "./RepoHealthCard"
import { RepoRecommendations }  from "./RepoRecommendations"
import { RefreshButton }        from "./RefreshButton"
import { DisconnectButton }     from "./DisconnectButton"
import { RepoDetail }           from "../types/RepoDetail"

interface Props {
  repo: RepoDetail
}

export function RepoDetailMobile({ repo }: Props) {
  return (
    <div className="min-h-screen">
      <MobilePageHeader title={repo.fullName} backHref="/repository">
        <div className="flex flex-col gap-1">
          {repo.description && (
            <p className="text-xs text-gray-400 truncate">{repo.description}</p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            {repo.isPrivate && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">Private</span>
            )}
            {repo.language && (
              <span className="text-xs text-gray-400">{repo.language}</span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Star className="w-3 h-3" />{repo.stars}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <GitFork className="w-3 h-3" />{repo.forks}
            </span>
            {repo.analyzedAt && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {new Date(repo.analyzedAt).toLocaleDateString("id-ID")}
              </span>
            )}
          </div>
        </div>
      </MobilePageHeader>

      <div className="px-4 pt-5 pb-6 flex flex-col gap-3">
        <div className="flex gap-2">
          <DisconnectButton
            id={repo.id}
            fullName={repo.fullName}
            className="flex-1 h-11 justify-center"
          />
          <RefreshButton
            id={repo.id}
            fullName={repo.fullName}
            className="flex-1 h-11 justify-center"
          />
        </div>

        <RepoProductivityCard repo={repo} />
        <RepoHealthCard       repo={repo} />
        <RepoRecommendations  recommendations={repo.healthRecommendations} />
      </div>
    </div>
  )
}
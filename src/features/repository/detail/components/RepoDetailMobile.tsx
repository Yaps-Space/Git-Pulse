"use client"

import { Star, GitFork, Clock } from "lucide-react"
import { MobilePageHeader }     from "@/shared/components/commons/MobilePageHeader"
import { RepoProductivityCard } from "./RepoProductivityCard"
import { RepoHealthCard }       from "./RepoHealthCard"
import { RepoRecommendations }  from "./RepoRecommendations"
import { RepoTeamSpaceCard }    from "./RepoTeamSpaceCard"
import { RefreshButton }        from "./RefreshButton"
import { DisconnectButton }     from "./DisconnectButton"
import { RepoDetail }           from "../types/RepoDetail"
import { useRefreshRepo }       from "../hooks/useRefreshRepo"
import { GitHubIcon, GitLabIcon } from "@/shared/components/commons/ProviderIcons"

interface Props {
  repo: RepoDetail
}

export function RepoDetailMobile({ repo }: Props) {
  const { loading, refresh } = useRefreshRepo(repo.id)

  return (
    <div className="min-h-screen">
      <MobilePageHeader
        title={
          <span className="flex items-center gap-1.5">
            {repo.provider === "gitlab" ? (
              <GitLabIcon className="w-4 h-4 text-[#fc6d26] flex-shrink-0" />
            ) : (
              <GitHubIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
            {repo.fullName}
          </span>
        }
        backHref="/repository"
      >
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
                Dianalisis {new Date(repo.analyzedAt).toLocaleDateString("id-ID")}
              </span>
            )}
          </div>
        </div>
      </MobilePageHeader>

      <div className="px-4 pt-5 pb-6 flex flex-col gap-3">
        <div className="flex gap-2">
          <DisconnectButton id={repo.id} fullName={repo.fullName} className="flex-1 h-11 justify-center" />
          <RefreshButton    fullName={repo.fullName} refreshing={loading} onRefresh={refresh} className="flex-1 h-11 justify-center" />
        </div>

        <RepoProductivityCard repo={repo} refreshing={loading} />
        <RepoHealthCard       repo={repo} refreshing={loading} />
        <RepoRecommendations  recommendations={repo.healthRecommendations} refreshing={loading} />
        <RepoTeamSpaceCard    repoFullName={repo.fullName} />
      </div>
    </div>
  )
}
"use client"

import { Star, GitFork, Clock } from "lucide-react"
import { RepoDetail } from "../types/RepoDetail"
import { RefreshButton }    from "./RefreshButton"
import { DisconnectButton } from "./DisconnectButton"

interface Props {
  repo: RepoDetail
}

export function RepoDetailHeader({ repo }: Props) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-gray-900">{repo.fullName}</h2>
        {repo.description && (
          <p className="text-sm text-gray-500">{repo.description}</p>
        )}
        <div className="flex items-center gap-4 mt-1">
          {repo.isPrivate && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-400">Private</span>
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

      <div className="flex items-center gap-2">
        <DisconnectButton id={repo.id} fullName={repo.fullName} />
        <RefreshButton fullName={repo.fullName} />
      </div>
    </div>
  )
}
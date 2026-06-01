"use client"

import { Star, GitFork, Clock } from "lucide-react"
import Image from "next/image"
import { Button } from "@/shared/components/ui/button"
import { GithubRepo } from "../types"
import { timeAgo } from "../helpers"

interface Props {
  repo:       GithubRepo
  connecting: string | null
  onConnect:  (repo: GithubRepo) => void
  variant?:   "default" | "mobile"
}

export function ConnectRepoItem({ repo, connecting, onConnect, variant = "default" }: Props) {
  const isConnecting = connecting === repo.full_name

  if (variant === "mobile") {
    return (
      <div className="bg-white rounded-2xl p-5 flex flex-col gap-3 border border-gray-100">
        <div className="flex items-center gap-3">
          <Image
            src={repo.owner.avatar_url}
            alt={repo.owner.login}
            width={32}
            height={32}
            className="rounded-full flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-gray-900 truncate">{repo.full_name}</p>
            {repo.description && (
              <p className="text-xs truncate text-gray-400 mt-0.5">{repo.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            repo.private ? "bg-orange-50 text-orange-400" : "bg-gray-100 text-gray-500"
          }`}>
            {repo.private ? "Private" : "Public"}
          </span>
          {repo.language && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-400">
              {repo.language}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Star className="w-3 h-3" />{repo.stargazers_count}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <GitFork className="w-3 h-3" />{repo.forks_count}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />{timeAgo(repo.pushed_at)}
            </span>
          </div>

          <Button
            onClick={() => onConnect(repo)}
            disabled={isConnecting}
            className="flex-shrink-0 w-28 rounded-md font-semibold gap-2 bg-[#00D964] hover:bg-[#00c057] text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-100"
          >
            {isConnecting ? (
              <>
                <div className="w-3.5 h-3.5 rounded-md border-2 border-gray-300 border-t-gray-400 animate-spin" />
                <span>Proses...</span>
              </>
            ) : "Connect"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Image
          src={repo.owner.avatar_url}
          alt={repo.owner.login}
          width={36}
          height={36}
          className="rounded-full flex-shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-sm text-gray-800">{repo.full_name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              repo.private ? "bg-orange-50 text-orange-400" : "bg-gray-100 text-gray-500"
            }`}>
              {repo.private ? "Private" : "Public"}
            </span>
            {repo.language && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-400">
                {repo.language}
              </span>
            )}
          </div>
          {repo.description && (
            <p className="text-xs mt-0.5 truncate text-gray-400">{repo.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Star className="w-3 h-3" />{repo.stargazers_count}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <GitFork className="w-3 h-3" />{repo.forks_count}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />{timeAgo(repo.pushed_at)}
            </span>
          </div>
        </div>
      </div>

      <Button
        onClick={() => onConnect(repo)}
        disabled={isConnecting}
        className="ml-4 flex-shrink-0 w-28 rounded-md font-semibold gap-2 bg-[#00D964] hover:bg-[#00c057] text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-100"
      >
        {isConnecting ? (
          <>
            <div className="w-3.5 h-3.5 rounded-md border-2 border-gray-300 border-t-gray-400 animate-spin" />
            <span>Proses...</span>
          </>
        ) : "Connect"}
      </Button>
    </div>
  )
}
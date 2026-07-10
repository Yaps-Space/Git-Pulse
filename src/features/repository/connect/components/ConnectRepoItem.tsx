"use client"

import { Star, GitFork, Clock } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar"
import { Button }    from "@/shared/components/ui/button"
import { GithubRepo, Provider } from "@/features/repository/types"
import { GitHubIcon, GitLabIcon } from "@/shared/components/commons/ProviderIcons"
import { timeAgo }   from "../helpers"

interface Props {
  repo:       GithubRepo
  connecting: string | null
  provider:   Provider
  onConnect:  (repo: GithubRepo) => void
  variant?:   "default" | "mobile"
}

function ProviderBadge({ provider }: { provider: Provider }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
      provider === "github" ? "bg-gray-100 text-gray-500" : "bg-orange-50 text-[#fc6d26]"
    }`}>
      {provider === "github"
        ? <GitHubIcon className="w-2.5 h-2.5" />
        : <GitLabIcon className="w-2.5 h-2.5" />
      }
      {provider === "github" ? "GitHub" : "GitLab"}
    </span>
  )
}

function ConnectBtn({ isConnecting, onClick }: { isConnecting: boolean; onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      disabled={isConnecting}
      className="flex-shrink-0 w-28 rounded-md font-semibold gap-2 bg-[#00D964] hover:bg-[#00c057] text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-100"
    >
      {isConnecting ? (
        <>
          <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin" />
          <span>Proses...</span>
        </>
      ) : "Connect"}
    </Button>
  )
}

export function ConnectRepoItem({ repo, connecting, provider, onConnect, variant = "default" }: Props) {
  const isConnecting = connecting === repo.full_name

  const visibilityBadge = (
    <span className={`text-xs px-2 py-0.5 rounded-full ${
      repo.private ? "bg-gray-100 text-gray-500" : "bg-[#BEF3DF]/25 text-[#00D964]"
    }`}>
      {repo.private ? "Private" : "Public"}
    </span>
  )

  const stats = (
    <>
      <span className="flex items-center gap-1 text-xs text-gray-400"><Star    className="w-3 h-3" />{repo.stargazers_count}</span>
      <span className="flex items-center gap-1 text-xs text-gray-400"><GitFork className="w-3 h-3" />{repo.forks_count}</span>
      <span className="flex items-center gap-1 text-xs text-gray-400"><Clock   className="w-3 h-3" />{timeAgo(repo.pushed_at)}</span>
    </>
  )

  if (variant === "mobile") {
    return (
      <div className="bg-white rounded-2xl p-5 flex flex-col gap-3 border border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            {repo.owner.avatar_url
              ? <AvatarImage src={repo.owner.avatar_url} alt={repo.owner.login} />
              : <AvatarFallback>{repo.owner.login.slice(0, 2).toUpperCase()}</AvatarFallback>
            }
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-gray-900 truncate">{repo.full_name}</p>
            {repo.description && (
              <p className="text-xs truncate text-gray-400 mt-0.5">{repo.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ProviderBadge provider={provider} />
          {visibilityBadge}
          {repo.language && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-400">{repo.language}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">{stats}</div>
          <ConnectBtn isConnecting={isConnecting} onClick={() => onConnect(repo)} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Avatar className="w-9 h-9 flex-shrink-0">
          {repo.owner.avatar_url
            ? <AvatarImage src={repo.owner.avatar_url} alt={repo.owner.login} />
            : <AvatarFallback>{repo.owner.login.slice(0, 2).toUpperCase()}</AvatarFallback>
          }
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-sm text-gray-800">{repo.full_name}</p>
            <ProviderBadge provider={provider} />
            {visibilityBadge}
            {repo.language && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-400">{repo.language}</span>
            )}
          </div>
          {repo.description && (
            <p className="text-xs mt-0.5 truncate text-gray-400">{repo.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1">{stats}</div>
        </div>
      </div>
      <ConnectBtn isConnecting={isConnecting} onClick={() => onConnect(repo)} />
    </div>
  )
}
"use client"

import Link from "next/link"
import { ChevronRight, GitFork, Star, Clock } from "lucide-react"
import { DashboardRepo } from "../types"
import { GitHubIcon, GitLabIcon } from "@/shared/components/commons/ProviderIcons"

interface Props {
  repos: DashboardRepo[]
}

function timeAgo(ms: number) {
  const diff = Date.now() - ms
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Hari ini"
  if (days === 1) return "Kemarin"
  if (days < 30)  return `${days} hari lalu`
  if (days < 365) return `${Math.floor(days / 30)} bulan lalu`
  return `${Math.floor(days / 365)} tahun lalu`
}

export function DashboardRepoSnapshot({ repos }: Props) {
  const visible = [...repos]
    .sort((a, b) => (b.analyzedAt ?? 0) - (a.analyzedAt ?? 0))
    .slice(0, 5)

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Repository Snapshot</h3>
        <Link href="/repository" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          See All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-8 gap-2">
          <p className="text-sm text-gray-400">Belum ada repository</p>
          <Link href="/repository/connect" className="text-xs text-[#00D964] hover:underline">
            Connect Repository
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {visible.map((repo) => (
            <Link
              key={repo.id}
              href={`/repository/${repo.id}`}
              className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="w-1 h-full min-h-[2rem] rounded-full bg-[#00D964] flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {repo.provider === "gitlab"
                    ? <GitLabIcon className="w-3.5 h-3.5 text-[#fc6d26] flex-shrink-0" />
                    : <GitHubIcon className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                  }
                  <p className="text-sm font-semibold text-gray-900 truncate">{repo.fullName}</p>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  {repo.language && <span className="text-xs text-gray-400">{repo.language}</span>}
                  {!repo.isPrivate && (
                    <>
                      <span className="flex items-center gap-0.5 text-xs text-gray-400">
                        <Star className="w-3 h-3" />{repo.stars}
                      </span>
                      <span className="flex items-center gap-0.5 text-xs text-gray-400">
                        <GitFork className="w-3 h-3" />{repo.forks}
                      </span>
                    </>
                  )}
                  {repo.analyzedAt && (
                    <span className="flex items-center gap-0.5 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />Dianalisis {timeAgo(repo.analyzedAt)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
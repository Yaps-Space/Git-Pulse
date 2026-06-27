"use client"

import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { Repo } from "../types"
import { PRODUCTIVITY_COLOR, PRODUCTIVITY_BG, GRADE_COLOR } from "../constants"
import { capitalizeFirst } from "@/shared/helpers"
import { GitHubIcon, GitLabIcon } from "@/shared/components/commons/ProviderIcons"

interface Props {
  repo:  Repo
  index: number
}

export function RepoMobileCard({ repo, index }: Props) {
  const router = useRouter()

  return (
    <div
      className="bg-white rounded-2xl p-5 flex flex-col gap-3 border border-gray-100 active:shadow-md transition-shadow"
      onClick={() => router.push(`/repository/${repo.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="font-bold text-sm text-gray-900 flex-shrink-0">{index}.</span>
          {repo.provider === "gitlab"
            ? <GitLabIcon className="w-3.5 h-3.5 text-[#fc6d26] flex-shrink-0" />
            : <GitHubIcon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
          }
          <p className="font-bold text-sm text-gray-900 flex-1 min-w-0 truncate">
            {repo.fullName}
          </p>
        </div>
        <span
          className="text-lg font-bold flex-shrink-0"
          style={{ color: GRADE_COLOR[repo.healthGrade] ?? "#888" }}
        >
          {repo.healthGrade || "-"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Productivity</span>
          <span
            className="text-xs px-2.5 py-0.5 rounded-full font-medium"
            style={{
              background: PRODUCTIVITY_BG[capitalizeFirst(repo.productivityState)]   ?? "#88888818",
              color:      PRODUCTIVITY_COLOR[capitalizeFirst(repo.productivityState)] ?? "#888",
            }}
          >
            {capitalizeFirst(repo.productivityState) || "-"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Health Score</span>
          <span className="text-xs font-semibold text-gray-700">
            {repo.healthScore ? `${repo.healthScore}/100` : "-"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Last Analyzed</span>
          <span className="text-xs text-gray-400">
            {repo.analyzedAt ? new Date(repo.analyzedAt).toLocaleDateString("id-ID") : "-"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 text-xs font-medium text-gray-400 mt-1">
        Lihat Detail
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </div>
  )
}
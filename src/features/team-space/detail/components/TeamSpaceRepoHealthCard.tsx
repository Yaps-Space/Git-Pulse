"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { GRADE_COLOR, PRODUCTIVITY_BG } from "@/features/repository/constants"
import { capitalizeFirst } from "@/shared/helpers"
import { GitHubIcon, GitLabIcon } from "@/shared/components/commons/ProviderIcons"

interface Props {
  healthScore:       number
  healthGrade:       string
  productivityState: string
  repoFullName:      string
  repoId:            string | null
  viewerRepoId:      string | null
  provider:          "github" | "gitlab"
  teamSpaceId:       string
  teamSpaceName:     string
  canViewDetail:     boolean
}

export function TeamSpaceRepoHealthCard({
  healthScore,
  healthGrade,
  productivityState,
  repoFullName,
  repoId,
  viewerRepoId,
  provider,
  teamSpaceId,
  teamSpaceName,
  canViewDetail,
}: Props) {
  const stateDisplay = capitalizeFirst(productivityState)
  const hasData      = healthScore > 0 || productivityState !== "-"
  const gradeColor   = GRADE_COLOR[healthGrade] ?? "#888"

  const repoHref = !canViewDetail
    ? null
    : viewerRepoId
      ? `/repository/${viewerRepoId}`
      : repoId
        ? `/repository/${repoId}?teamSpaceId=${teamSpaceId}&teamSpaceName=${encodeURIComponent(teamSpaceName)}`
        : null

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-semibold text-white flex-shrink-0">Repository Health</span>
          <span className="text-xs text-gray-400 flex-shrink-0">·</span>
          {provider === "gitlab" ? (
            <GitLabIcon className="w-3 h-3 text-[#fc6d26] flex-shrink-0" />
          ) : (
            <GitHubIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
          )}
          <span className="text-xs text-gray-400 truncate">{repoFullName}</span>
        </div>
        {repoHref && (
          <Link
            href={repoHref}
            className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:underline flex-shrink-0 whitespace-nowrap"
          >
            Lihat Detail Repository
            <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {!hasData ? (
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          <p className="text-xs text-gray-400">Repository belum dianalisis</p>
          {repoHref && (
            <Link
              href={repoHref}
              className="text-xs font-semibold text-[#00D964] hover:underline flex-shrink-0"
            >
              Analisis Sekarang →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 divide-x divide-gray-700">
          <div className="flex flex-col gap-1 px-4 pt-3 pb-4">
            <span className="text-xs font-medium text-gray-400">Health Score</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold tabular-nums" style={{ color: gradeColor }}>
                {healthScore.toFixed(1)}
              </span>
              <span
                className="text-lg font-bold px-2.5 py-0.5 rounded-md"
                style={{
                  color:      gradeColor,
                  background: `${gradeColor}18`,
                }}
              >
                {healthGrade !== "-" ? healthGrade : "—"}
              </span>
            </div>
            <div className="w-full h-1 rounded-md bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-md"
                style={{ width: `${Math.min(healthScore, 100)}%`, background: gradeColor }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3.5 px-4 py-3">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-gray-400 pb-1">Status Produktivitas</span>
            </div>
            <span
              className="text-xl font-semibold"
              style={{ color: PRODUCTIVITY_BG[stateDisplay] ?? "#888" }}
            >
              {stateDisplay !== "-" ? stateDisplay : "—"}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
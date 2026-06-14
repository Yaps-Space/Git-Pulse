"use client"

import { GRADE_COLOR, PRODUCTIVITY_BG, PRODUCTIVITY_COLOR } from "@/features/repository/constants"
import { capitalizeFirst } from "@/shared/helpers"

interface Props {
  healthScore:       number
  healthGrade:       string
  productivityState: string
}

export function TeamSpaceRepoStats({ healthScore, healthGrade, productivityState }: Props) {
  const hasData      = healthScore > 0 || productivityState !== "-"
  const stateDisplay = capitalizeFirst(productivityState)

  if (!hasData) return (
    <div className="px-3 py-2 rounded-md bg-gray-50 text-center">
      <span className="text-xs text-gray-400">Repo belum dianalisis</span>
    </div>
  )

  return (
    <div className="flex flex-col gap-1.5">
      {/* Health Score */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50"
      >
        <span className="text-xs text-gray-500">Health Score</span>
        <div className="flex items-center gap-1.5">
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: GRADE_COLOR[healthGrade] ?? "#888" }}
          >
            {healthScore.toFixed(1)}
          </span>
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-sm"
            style={{
              color:      GRADE_COLOR[healthGrade] ?? "#888",
              background: `${GRADE_COLOR[healthGrade] ?? "#888"}25`,
            }}
          >
            {healthGrade !== "-" ? healthGrade : "—"}
          </span>
        </div>
      </div>

      {/* Productivity State */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50"
      >
        <span className="text-xs text-gray-500">
          Status
        </span>
        <span
            className="text-xs px-2 py-0.5 rounded-sm"
            style={{
                color:      PRODUCTIVITY_COLOR[stateDisplay] ?? "#888",
                background: PRODUCTIVITY_BG[stateDisplay]    ?? "transparent",
            }}
            >
            {stateDisplay !== "-" ? stateDisplay : "—"}
        </span>
      </div>
    </div>
  )
}
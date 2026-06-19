"use client"

import { GRADE_COLOR, PRODUCTIVITY_BG, PRODUCTIVITY_COLOR } from "@/features/repository/constants"
import { capitalizeFirst } from "@/shared/helpers"

interface Props {
  avgHealthScore:     number
  avgHealthGrade:     string
  productivityStates: string[]
}

export function TeamSpaceRepoStats({ avgHealthScore, avgHealthGrade, productivityStates }: Props) {
  const hasData = avgHealthScore > 0 || productivityStates.length > 0

  // Deduplicate status — kalau semua sama tampilkan satu, kalau beda tampilkan yang unik
  const uniqueStates = [...new Set(productivityStates.map(s => capitalizeFirst(s)))]

  if (!hasData) return (
    <div className="px-3 py-2 rounded-md bg-gray-50 text-center">
      <span className="text-xs text-gray-400">Repo belum dianalisis</span>
    </div>
  )

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50">
        <span className="text-xs text-gray-500">Health Score</span>
        <div className="flex items-center gap-1.5">
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: GRADE_COLOR[avgHealthGrade] ?? "#888" }}
          >
            {avgHealthScore.toFixed(1)}
          </span>
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-sm"
            style={{
              color:      GRADE_COLOR[avgHealthGrade] ?? "#888",
              background: `${GRADE_COLOR[avgHealthGrade] ?? "#888"}25`,
            }}
          >
            {avgHealthGrade !== "-" ? avgHealthGrade : "—"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50">
        <span className="text-xs text-gray-500">Status</span>
        <div className="flex items-center gap-1">
          {uniqueStates.length === 0 ? (
            <span className="text-xs text-gray-400">—</span>
          ) : (
            uniqueStates.map((display, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-sm"
                style={{
                  color:      PRODUCTIVITY_COLOR[display] ?? "#888",
                  background: PRODUCTIVITY_BG[display]    ?? "transparent",
                }}
              >
                {display}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
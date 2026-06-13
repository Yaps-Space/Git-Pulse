"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { GRADE_COLOR, PRODUCTIVITY_BG } from "@/features/repository/constants"
import { capitalizeFirst } from "@/shared/helpers"

interface Props {
  healthScore:       number
  healthGrade:       string
  productivityState: string
  repoFullName:      string
  repoId:            string | null
}

export function TeamSpaceRepoHealthCard({
  healthScore,
  healthGrade,
  productivityState,
  repoId,
}: Props) {
  const stateDisplay = capitalizeFirst(productivityState)
  const hasData      = healthScore > 0 || productivityState !== "-"
  const gradeColor   = GRADE_COLOR[healthGrade] ?? "#888"

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-white">Repository Health</span>
        </div>
        {repoId && (
          <Link
            href={`/repository/${repoId}`}
            className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:underline"
          >
            Lihat Detail Repository
            <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {!hasData ? (
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          <p className="text-xs text-gray-400">Repository belum dianalisis</p>
          {repoId && (
            <Link
              href={`/repository/${repoId}`}
              className="text-xs font-semibold text-[#00D964] hover:underline flex-shrink-0"
            >
              Analisis Sekarang →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 divide-x divide-gray-700">
          {/* Health Score */}
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

          {/* Productivity State */}
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
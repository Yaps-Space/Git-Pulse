"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { RepoDetail } from "../types/RepoDetail"
import { GRADE_COLOR } from "../../constants"
import { ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react"
import { BREAKDOWN_CONFIG } from "../constants/HealthCard"

interface Props {
  repo:        RepoDetail
  refreshing?: boolean
}

type BreakdownKey = keyof typeof BREAKDOWN_CONFIG

function barColor(ratio: number) {
  if (ratio >= 0.7) return "#3FB950"
  if (ratio >= 0.4) return "#F9C74F"
  return "#F85149"
}

function BreakdownRow({
  categoryKey,
  repo,
}: {
  categoryKey: BreakdownKey
  repo:        RepoDetail
}) {
  const [open, setOpen] = useState(false)
  const config          = BREAKDOWN_CONFIG[categoryKey]
  const item            = repo.healthBreakdown?.[categoryKey]

  if (!item) return null

  const value   = item.contribution ?? 0
  const ratio   = value / config.max
  const missing = item.missing ?? []

  return (
    <div className="rounded-lg border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-3 py-2 flex flex-col gap-1.5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-gray-800">{config.label}</span>
            {missing.length > 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500">
                {missing.length} missing
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">
              {value.toFixed(1)}/{config.max}
            </span>
            {open
              ? <ChevronUp   className="w-3.5 h-3.5 text-gray-400" />
              : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            }
          </div>
        </div>
        <div className="w-full rounded-full h-1.5 bg-gray-100">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${Math.min(ratio * 100, 100)}%`, background: barColor(ratio) }}
          />
        </div>
      </button>

      {open && (
        <div className="px-3 pb-2 pt-1 bg-gray-50 grid grid-cols-2 gap-x-10 border-t border-gray-100">
          {config.detailKeys.map(dk => {
            const raw     = item.details?.[dk.key]
            const display = raw === undefined
              ? "—"
              : "format" in dk && typeof dk.format === "function"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ? (dk as any).format(raw)
                : typeof raw === "boolean"
                  ? (raw ? "Ya" : "Tidak")
                  : String(raw)

            const isBool = typeof raw === "boolean"

            return (
              <div key={dk.key} className="flex items-center justify-between gap-2 py-0.5">
                <span className="text-[11px] text-gray-500 truncate">{dk.label}</span>
                {isBool ? (
                  raw
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    : <XCircle      className="w-3.5 h-3.5 text-red-400   flex-shrink-0" />
                ) : (
                  <span className="text-[11px] font-semibold text-gray-700 flex-shrink-0">{display}</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function RepoHealthCard({ repo, refreshing }: Props) {
  return (
    <Card className="relative overflow-hidden">
      {refreshing && (
        <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center rounded-xl">
          <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-[#00D964] animate-spin" />
        </div>
      )}

      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <div>
          <CardTitle className="text-base font-bold">Health Score</CardTitle>
          <p className="text-xs text-gray-400 mt-0.5">{repo.healthLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tabular-nums" style={{ color: GRADE_COLOR[repo.healthGrade] ?? "#888" }}>
            {repo.healthScore.toFixed(1)}
          </span>
          <span
            className="text-lg font-bold px-2 py-0.5 rounded-md"
            style={{
              color:      GRADE_COLOR[repo.healthGrade] ?? "#888",
              background: `${GRADE_COLOR[repo.healthGrade] ?? "#888"}15`,
            }}
          >
            {repo.healthGrade}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {(Object.keys(BREAKDOWN_CONFIG) as BreakdownKey[]).map(key => (
          <BreakdownRow key={key} categoryKey={key} repo={repo} />
        ))}
      </CardContent>
    </Card>
  )
}
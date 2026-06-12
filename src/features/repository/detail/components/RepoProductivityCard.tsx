"use client"

import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { RepoDetail } from "../types/RepoDetail"
import { PRODUCTIVITY_BG, PRODUCTIVITY_COLOR } from "../../constants"
import { PRODUCTIVITY_ITEMS } from "../constants/Productivity"
import { capitalizeFirst } from "@/shared/helpers"

interface Props {
  repo:        RepoDetail
  refreshing?: boolean
}

export function RepoProductivityCard({ repo, refreshing }: Props) {
  const trendLabel = repo.commitTrend > 0.01 ? "Meningkat"
    : repo.commitTrend < -0.01 ? "Menurun" : "Stabil"
  const trendColor = repo.commitTrend > 0.01 ? "#3FB950"
    : repo.commitTrend < -0.01 ? "#F85149" : "#000000"
  const TrendIcon  = repo.commitTrend > 0.01 ? TrendingUp
    : repo.commitTrend < -0.01 ? TrendingDown : Minus

  const items = [
    ...PRODUCTIVITY_ITEMS(repo).slice(0, 2).map(item => ({ ...item, color: undefined, icon: null })),
    { label: "Commit Trend",      value: trendLabel, color: trendColor, icon: TrendIcon },
    { ...PRODUCTIVITY_ITEMS(repo)[2], color: undefined, icon: null },
  ]

  return (
    <Card className="relative overflow-hidden">
      {refreshing && (
        <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center rounded-xl">
          <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-[#00D964] animate-spin" />
        </div>
      )}
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold">Productivity State</CardTitle>
        <span
          className="px-3 py-1 rounded-md text-sm"
          style={{
            background: PRODUCTIVITY_BG[capitalizeFirst(repo.productivityState)]   ?? "#88888818",
            color:      PRODUCTIVITY_COLOR[capitalizeFirst(repo.productivityState)] ?? "#888",
          }}
        >
          {capitalizeFirst(repo.productivityState) || "-"}
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <span className="text-xs text-gray-800">{item.label}</span>
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: item.color ?? "#333" }}>
                {item.icon && <item.icon className="w-3.5 h-3.5" />}
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {repo.productivityRec && (
          <div className="mt-4 p-3 rounded-xl bg-[#83ECA7] flex items-start gap-2">
            <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-800">{repo.productivityRec}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
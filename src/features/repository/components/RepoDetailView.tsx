"use client"

import { Star, GitFork, Clock } from "lucide-react"
import { RefreshButton } from "./RefreshButton"
import { RepoDetail } from "../types"
import { PRODUCTIVITY_COLOR, GRADE_COLOR } from "../constants"

interface Props {
  repo: RepoDetail
}

export function RepoDetailView({ repo }: Props) {
  const trendLabel = repo.commitTrend > 0.01 ? "Meningkat"
    : repo.commitTrend < -0.01 ? "Menurun" : "Stabil"
  const trendColor = repo.commitTrend > 0.01 ? "#3FB950"
    : repo.commitTrend < -0.01 ? "#F85149" : "#F9C74F"

  const breakdownItems = [
    { label: "Dokumentasi",      value: repo.healthBreakdown?.dokumentasi     ?? 0, max: 15 },
    { label: "Issue Management", value: repo.healthBreakdown?.issueManagement ?? 0, max: 20 },
    { label: "Commit Activity",  value: repo.healthBreakdown?.commitActivity  ?? 0, max: 25 },
    { label: "Konsistensi",      value: repo.healthBreakdown?.konsistensi     ?? 0, max: 20 },
    { label: "Popularitas",      value: repo.healthBreakdown?.popularitas     ?? 0, max: 10 },
    { label: "Recency",          value: repo.healthBreakdown?.recency         ?? 0, max: 10 },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {repo.isPrivate && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-400">Private</span>
            )}
          </div>
          {repo.description && (
            <p className="text-sm text-gray-500">{repo.description}</p>
          )}
          <div className="flex items-center gap-4 mt-1">
            {repo.language && (
              <span className="text-xs text-gray-400">{repo.language}</span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Star className="w-3 h-3" />{repo.stars}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <GitFork className="w-3 h-3" />{repo.forks}
            </span>
            {repo.analyzedAt && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                Dianalisis {new Date(repo.analyzedAt).toLocaleDateString("id-ID")}
              </span>
            )}
          </div>
        </div>
        <RefreshButton fullName={repo.fullName} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-gray-900">Productivity State</h2>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold text-white"
              style={{ background: PRODUCTIVITY_COLOR[repo.productivityState] ?? "#888" }}
            >
              {repo.productivityState}
            </span>
          </div>

          <div className="flex flex-col">
            {[
              { label: "Commit Frequency",     value: `${repo.commitFrequency}/minggu`,                                                                                    color: undefined },
              { label: "Activity Consistency", value: repo.activityConsistency <= 1.5 ? "Sangat Stabil" : repo.activityConsistency <= 3 ? "Stabil" : "Tidak Stabil",     color: undefined },
              { label: "Commit Trend",         value: trendLabel,                                                                                                           color: trendColor },
              { label: "Active Weeks Ratio",   value: `${Math.round(repo.activeDaysRatio * 100)}%`,                                                                        color: undefined },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-400">{item.label}</span>
                <span className="text-sm font-semibold" style={{ color: item.color ?? "#333" }}>{item.value}</span>
              </div>
            ))}
          </div>

          {repo.productivityRec && (
            <div className="mt-4 p-3 rounded-xl bg-[#BEF3DF] flex items-start gap-2">
              <span className="text-[#00D964] mt-0.5">💡</span>
              <p className="text-sm text-gray-800">{repo.productivityRec}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-gray-900">Health Score</h2>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold" style={{ color: GRADE_COLOR[repo.healthGrade] ?? "#888" }}>
                {repo.healthScore}
              </span>
              <div className="flex flex-col items-center">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: GRADE_COLOR[repo.healthGrade] ?? "#888" }}
                >
                  {repo.healthGrade}
                </span>
                <span className="text-xs mt-0.5 text-gray-400">{repo.healthLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-4">
            {breakdownItems.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">{item.label}</span>
                  <span className="text-xs font-semibold text-gray-700">{item.value}/{item.max}</span>
                </div>
                <div className="w-full rounded-full h-2 bg-gray-100">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width:      `${(item.value / item.max) * 100}%`,
                      background: item.value / item.max >= 0.7 ? "#3FB950"
                        : item.value / item.max >= 0.4 ? "#F9C74F" : "#F85149",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {repo.healthRecommendations.length > 0 && (
        <div className="bg-gray-900 rounded-2xl p-6">
          <h3 className="font-bold text-white mb-3">Rekomendasi</h3>
          <ul className="flex flex-col gap-2">
            {repo.healthRecommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D964] flex-shrink-0 mt-1.5" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
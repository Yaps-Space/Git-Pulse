"use client"

import RefreshButton from "./RefreshButton"

interface Repo {
  id:                    string
  fullName:              string
  description:           string | null
  language:              string | null
  stars:                 number
  forks:                 number
  isPrivate:             boolean
  productivityState:     string
  commitFrequency:       number
  activityConsistency:   number
  commitTrend:           number
  activeDaysRatio:       number
  productivityRec:       string | null
  healthScore:           number
  healthGrade:           string
  healthLabel:           string
  healthBreakdown:       Record<string, number>
  healthRecommendations: string[]
  analyzedAt:            number | null
}

const productivityColor: Record<string, string> = {
  Active:   "#3FB950",
  Moderate: "#F9C74F",
  Inactive: "#F85149",
}

const gradeColor: Record<string, string> = {
  A: "#3FB950", B: "#7BC67E", C: "#F9C74F", D: "#F0883E", E: "#F85149"
}

export default function RepoDetailView({ repo }: { repo: Repo }) {
  const trendLabel = repo.commitTrend > 0.01 ? "↗ Meningkat"
    : repo.commitTrend < -0.01 ? "↘ Menurun" : "→ Stabil"
  const trendColor = repo.commitTrend > 0.01 ? "#3FB950"
    : repo.commitTrend < -0.01 ? "#F85149" : "#F9C74F"

  const breakdownItems = [
    { label: "Dokumentasi",      value: repo.healthBreakdown?.dokumentasi     || 0, max: 15 },
    { label: "Issue Management", value: repo.healthBreakdown?.issueManagement || 0, max: 20 },
    { label: "Commit Activity",  value: repo.healthBreakdown?.commitActivity  || 0, max: 25 },
    { label: "Konsistensi",      value: repo.healthBreakdown?.konsistensi     || 0, max: 20 },
    { label: "Popularitas",      value: repo.healthBreakdown?.popularitas     || 0, max: 10 },
    { label: "Recency",          value: repo.healthBreakdown?.recency         || 0, max: 10 },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {repo.isPrivate && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FFF3E0", color: "#F0883E" }}>
                Private
              </span>
            )}
          </div>
          {repo.description && (
            <p className="text-sm text-gray-500">{repo.description}</p>
          )}
          <div className="flex items-center gap-4 mt-1">
            {repo.language && <span className="text-xs text-gray-400">📝 {repo.language}</span>}
            <span className="text-xs text-gray-400">⭐ {repo.stars}</span>
            <span className="text-xs text-gray-400">🍴 {repo.forks}</span>
            {repo.analyzedAt && (
              <span className="text-xs text-gray-400">
                🕐 Dianalisis {new Date(repo.analyzedAt).toLocaleDateString("id-ID")}
              </span>
            )}
          </div>
        </div>
        <RefreshButton repoId={repo.id} fullName={repo.fullName} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-gray-900">Productivity State</h2>
            <span className="px-3 py-1 rounded-full text-sm font-semibold text-white"
              style={{ background: productivityColor[repo.productivityState] || "#888" }}>
              {repo.productivityState}
            </span>
          </div>
          <div className="flex flex-col gap-0">
            {[
              { label: "Commit Frequency",     value: `${repo.commitFrequency}/minggu` },
              { label: "Activity Consistency", value: repo.activityConsistency <= 1.5 ? "Sangat Stabil" : repo.activityConsistency <= 3 ? "Stabil" : "Tidak Stabil" },
              { label: "Commit Trend",         value: trendLabel, color: trendColor },
              { label: "Active Weeks Ratio",   value: `${Math.round(repo.activeDaysRatio * 100)}%` },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-400">{item.label}</span>
                <span className="text-sm font-semibold" style={{ color: item.color || "#333" }}>{item.value}</span>
              </div>
            ))}
          </div>
          {repo.productivityRec && (
            <div className="mt-4 p-3 rounded-xl bg-green-50">
              <p className="text-sm text-gray-700">💡 {repo.productivityRec}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-gray-900">Health Score</h2>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold" style={{ color: gradeColor[repo.healthGrade] || "#888" }}>
                {repo.healthScore}
              </span>
              <div className="flex flex-col items-center">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: gradeColor[repo.healthGrade] || "#888" }}>
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
                  <div className="h-2 rounded-full transition-all"
                    style={{
                      width:      `${(item.value / item.max) * 100}%`,
                      background: item.value / item.max >= 0.7 ? "#3FB950"
                        : item.value / item.max >= 0.4 ? "#F9C74F" : "#F85149"
                    }}/>
                </div>
              </div>
            ))}
          </div>
          {repo.healthRecommendations.length > 0 && (
            <div className="p-3 rounded-xl bg-orange-50">
              <p className="text-xs font-semibold mb-2 text-orange-400">💡 Rekomendasi</p>
              <ul className="flex flex-col gap-1">
                {repo.healthRecommendations.map((rec, i) => (
                  <li key={i} className="text-xs flex gap-2 text-gray-700"><span>•</span>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
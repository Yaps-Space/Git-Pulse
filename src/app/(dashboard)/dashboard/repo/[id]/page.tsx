import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/shared/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import Link from "next/link"
import RefreshButton from "@/features/dashboard/components/RefreshButton"

async function getRepo(id: string) {
  try {
    const snap = await getDoc(doc(db, "repositories", id))
    if (!snap.exists()) return null
    const data = snap.data()
    return {
      id:                    snap.id,
      fullName:              data.fullName,
      name:                  data.name,
      description:           data.description,
      language:              data.language,
      stars:                 data.stars,
      forks:                 data.forks,
      isPrivate:             data.isPrivate,
      userId:                data.userId,
      productivityState:     data.productivityState,
      commitFrequency:       data.commitFrequency,
      activityConsistency:   data.activityConsistency,
      commitTrend:           data.commitTrend,
      activeDaysRatio:       data.activeDaysRatio,
      productivityRec:       data.productivityRec,
      healthScore:           data.healthScore,
      healthGrade:           data.healthGrade,
      healthLabel:           data.healthLabel,
      healthBreakdown:       data.healthBreakdown,
      healthRecommendations: data.healthRecommendations || [],
      analyzedAt:            data.analyzedAt?.seconds ? data.analyzedAt.seconds * 1000 : null,
    }
  } catch (e) {
    return null
  }
}

const productivityColor: Record<string, string> = {
  Active:   "#3FB950",
  Moderate: "#F9C74F",
  Inactive: "#F85149",
}

const gradeColor: Record<string, string> = {
  A: "#3FB950", B: "#7BC67E", C: "#F9C74F", D: "#F0883E", E: "#F85149"
}

export default async function RepoDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params 

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const repo = await getRepo(id)  // ← pakai id bukan params.id
  if (!repo || repo.userId !== session.user.id) redirect("/dashboard")

  const trendLabel = repo.commitTrend > 0.01 ? "↗ Meningkat"
    : repo.commitTrend < -0.01 ? "↘ Menurun" : "→ Stabil"
  const trendColor = repo.commitTrend > 0.01 ? "#3FB950"
    : repo.commitTrend < -0.01 ? "#F85149" : "#F9C74F"

  const breakdownItems = [
    { label: "Dokumentasi",     value: repo.healthBreakdown?.dokumentasi    || 0, max: 15 },
    { label: "Issue Management",value: repo.healthBreakdown?.issueManagement|| 0, max: 20 },
    { label: "Commit Activity", value: repo.healthBreakdown?.commitActivity  || 0, max: 25 },
    { label: "Konsistensi",     value: repo.healthBreakdown?.konsistensi    || 0, max: 20 },
    { label: "Popularitas",     value: repo.healthBreakdown?.popularitas    || 0, max: 10 },
    { label: "Recency",         value: repo.healthBreakdown?.recency        || 0, max: 10 },
  ]

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard"
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-colors"
          style={{ color: "#555" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>{repo.fullName}</h1>
            {repo.isPrivate && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FFF3E0", color: "#F0883E" }}>
                Private
              </span>
            )}
          </div>
          {repo.description && (
            <p className="text-sm mt-1" style={{ color: "#888" }}>{repo.description}</p>
          )}
          <div className="flex items-center gap-4 mt-1">
            {repo.language && <span className="text-xs" style={{ color: "#aaa" }}>📝 {repo.language}</span>}
            <span className="text-xs" style={{ color: "#aaa" }}>⭐ {repo.stars}</span>
            <span className="text-xs" style={{ color: "#aaa" }}>🍴 {repo.forks}</span>
            {repo.analyzedAt && (
              <span className="text-xs" style={{ color: "#aaa" }}>
                🕐 Dianalisis {new Date(repo.analyzedAt).toLocaleDateString("id-ID")}
              </span>
            )}
          </div>
        </div>
        <RefreshButton repoId={repo.id} fullName={repo.fullName} />
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Productivity Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg" style={{ color: "#1E3A5F" }}>Productivity State</h2>
            <span className="px-3 py-1 rounded-full text-sm font-semibold text-white"
              style={{ background: productivityColor[repo.productivityState] || "#888" }}>
              {repo.productivityState}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { label: "Commit Frequency",     value: `${repo.commitFrequency}/minggu` },
              { label: "Activity Consistency", value: repo.activityConsistency <= 1.5 ? "Sangat Stabil" : repo.activityConsistency <= 3 ? "Stabil" : "Tidak Stabil" },
              { label: "Commit Trend",         value: trendLabel, color: trendColor },
              { label: "Active Weeks Ratio",   value: `${Math.round(repo.activeDaysRatio * 100)}%` },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b"
                style={{ borderColor: "#F0F0F0" }}>
                <span className="text-sm" style={{ color: "#888" }}>{item.label}</span>
                <span className="text-sm font-semibold" style={{ color: item.color || "#333" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {repo.productivityRec && (
            <div className="mt-4 p-3 rounded-xl flex gap-2" style={{ background: "#F0FFF4" }}>
              <span>💡</span>
              <p className="text-sm" style={{ color: "#333" }}>{repo.productivityRec}</p>
            </div>
          )}
        </div>

        {/* Health Score Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg" style={{ color: "#1E3A5F" }}>Health Score</h2>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold" style={{ color: gradeColor[repo.healthGrade] || "#888" }}>
                {repo.healthScore}
              </span>
              <div className="flex flex-col items-center">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: gradeColor[repo.healthGrade] || "#888" }}>
                  {repo.healthGrade}
                </span>
                <span className="text-xs mt-0.5" style={{ color: "#888" }}>{repo.healthLabel}</span>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="flex flex-col gap-3 mb-4">
            {breakdownItems.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: "#888" }}>{item.label}</span>
                  <span className="text-xs font-semibold" style={{ color: "#333" }}>
                    {item.value}/{item.max}
                  </span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: "#F0F0F0" }}>
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

          {/* Recommendations */}
          {repo.healthRecommendations.length > 0 && (
            <div className="p-3 rounded-xl" style={{ background: "#FFF8F0" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "#F0883E" }}>💡 Rekomendasi</p>
              <ul className="flex flex-col gap-1">
                {repo.healthRecommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-xs flex gap-2" style={{ color: "#333" }}>
                    <span>•</span>{rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
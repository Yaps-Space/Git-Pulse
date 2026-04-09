import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import Link from "next/link"
import RepoTable from "@/components/dashboard/RepoTable"

async function getUserRepos(userId: string) {
  try {
    const q    = query(collection(db, "repositories"), where("userId", "==", userId))
    const snap = await getDocs(q)
    return snap.docs.map(doc => {
      const data = doc.data()
      return {
        id:                doc.id,
        fullName:          data.fullName          || "",
        productivityState: data.productivityState || "-",
        healthScore:       data.healthScore       || 0,
        healthGrade:       data.healthGrade       || "-",
        // Convert Firestore Timestamp ke milliseconds
        analyzedAt:        data.analyzedAt?.seconds
                             ? data.analyzedAt.seconds * 1000
                             : null,
      }
    })
  } catch (e) {
    return []
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const repos       = await getUserRepos(session.user.id)
  const activeRepos = repos.filter(r => r.productivityState === "Active").length
  const avgHealth   = repos.length > 0
    ? Math.round(repos.reduce((sum, r) => sum + (r.healthScore || 0), 0) / repos.length)
    : 0

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#1E3A5F" }}>
          Halo, {session.user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-sm" style={{ color: "#888" }}>
          Berikut ringkasan kinerja repository GitHub kamu
        </p>
      </div>

      {/* Account Snapshot */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Repository", value: repos.length,                              icon: "📁", color: "#2E86C1" },
          { label: "Repository Aktif", value: activeRepos,                               icon: "🟢", color: "#3FB950" },
          { label: "Avg Health Score", value: repos.length > 0 ? `${avgHealth}/100` : "-", icon: "❤️", color: "#F0883E" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: `${stat.color}18` }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-sm" style={{ color: "#888" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Repository Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "#F0F0F0" }}>
          <h2 className="font-bold text-lg" style={{ color: "#1E3A5F" }}>Repository</h2>
          <Link href="/dashboard/connect"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: "#2E86C1" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Connect Repository
          </Link>
        </div>
        <RepoTable repos={repos} />
      </div>
    </div>
  )
}
"use client"
import { useRouter } from "next/navigation"

interface Repo {
  id:                string
  fullName:          string
  productivityState: string
  healthScore:       number
  healthGrade:       string
  analyzedAt:        any
}

const productivityColor: Record<string, string> = {
  Active:   "#3FB950",
  Moderate: "#F9C74F",
  Inactive: "#F85149",
}
const gradeColor: Record<string, string> = {
  A: "#3FB950", B: "#7BC67E", C: "#F9C74F", D: "#F0883E", E: "#F85149"
}

export default function RepoTable({ repos }: { repos: Repo[] }) {
  const router = useRouter()

  if (repos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <span className="text-5xl">📭</span>
        <p className="font-medium" style={{ color: "#333" }}>Belum ada repository</p>
        <p className="text-sm" style={{ color: "#888" }}>
          Klik "Connect Repository" untuk mulai menganalisis
        </p>
      </div>
    )
  }

  return (
    <table className="w-full">
      <thead>
        <tr style={{ background: "#F4F6F9" }}>
          {["Repository", "Productivity", "Health Score", "Grade", "Last Analyzed"].map(h => (
            <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#888" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {repos.map((repo) => (
          <tr key={repo.id}
            className="border-t hover:bg-gray-50 transition-colors cursor-pointer"
            style={{ borderColor: "#F0F0F0" }}
            onClick={() => router.push(`/dashboard/repo/${repo.id}`)}>
            <td className="px-6 py-4">
              <p className="font-medium text-sm" style={{ color: "#1E3A5F" }}>{repo.fullName}</p>
            </td>
            <td className="px-6 py-4">
              <span className="flex items-center gap-2 text-sm font-medium"
                style={{ color: productivityColor[repo.productivityState] || "#888" }}>
                <span className="w-2 h-2 rounded-full"
                  style={{ background: productivityColor[repo.productivityState] || "#888" }}/>
                {repo.productivityState || "-"}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm font-medium" style={{ color: "#333" }}>
                {repo.healthScore ? `${repo.healthScore}/100` : "-"}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ background: gradeColor[repo.healthGrade] || "#888", display: "inline-flex" }}>
                {repo.healthGrade || "-"}
              </span>
            </td>
            <td className="px-6 py-4 text-sm" style={{ color: "#888" }}>
            {repo.analyzedAt
                ? new Date(repo.analyzedAt).toLocaleDateString("id-ID")
                : "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
"use client"

import { useRouter } from "next/navigation"

interface Repo {
  id:                string
  fullName:          string
  productivityState: string
  healthScore:       number
  healthGrade:       string
  analyzedAt:        number | null
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
        <p className="font-medium text-gray-700">Belum ada repository</p>
        <p className="text-sm text-gray-500">Klik &quot;Connect Repository&quot; untuk mulai menganalisis</p>
      </div>
    )
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50">
          {["Repository", "Productivity", "Health Score", "Grade", "Last Analyzed"].map(h => (
            <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {repos.map((repo) => (
          <tr
            key={repo.id}
            className="border-t border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => router.push(`/repository/${repo.id}`)}
          >
            <td className="px-6 py-4">
              <p className="font-medium text-sm text-gray-800">{repo.fullName}</p>
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
              <span className="text-sm font-medium text-gray-700">
                {repo.healthScore ? `${repo.healthScore}/100` : "-"}
              </span>
            </td>
            <td className="px-6 py-4">
              <span
                className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-white text-sm font-bold"
                style={{ background: gradeColor[repo.healthGrade] || "#888" }}
              >
                {repo.healthGrade || "-"}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-400">
              {repo.analyzedAt ? new Date(repo.analyzedAt).toLocaleDateString("id-ID") : "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
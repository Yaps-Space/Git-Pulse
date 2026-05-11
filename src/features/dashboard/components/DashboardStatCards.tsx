"use client"

import { GitBranch, Activity, Users, Heart } from "lucide-react"

interface Props {
  totalRepos:  number
  activeRepos: number
  totalTeams:  number
  avgHealth:   number
}

export function DashboardStatCards({ totalRepos, activeRepos, totalTeams, avgHealth }: Props) {
  const stats = [
    { label: "Connect Repos",      value: totalRepos,              sub: "Repository yang terhubung", icon: GitBranch, color: "#00D964" },
    { label: "Active Repos",       value: activeRepos,             sub: "Repository yang aktif",     icon: Activity,  color: "#00D964" },
    { label: "Total Team Space",   value: totalTeams,              sub: "Total tim",                 icon: Users,     color: "#00D964" },
    { label: "Overall Health Score", value: `${avgHealth}/100`,    sub: "Rata-rata health score",    icon: Heart,     color: "#00D964" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ label, value, sub, icon: Icon, color }) => (
        <div key={label} className="bg-gray-900 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <p className="text-white/70 text-sm font-medium">{label}</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + "20" }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
          </div>
          <div>
            <p className="text-white text-2xl font-bold">{value}</p>
            <p className="text-white/40 text-xs mt-0.5">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
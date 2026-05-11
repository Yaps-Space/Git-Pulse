"use client"

import { useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart"
import { activityChartConfig } from "../constants/chart"
import { DashboardRepo } from "../types"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

interface Props {
  repos: DashboardRepo[]
}

export function DashboardActivityChart({ repos }: Props) {
  const [filter, setFilter] = useState<"commits" | "active_weeks">("commits")

  const data = useMemo(() => {
    if (repos.length === 0) return MONTHS.map(m => ({ month: m, commits: 0 }))

    return MONTHS.map((month) => {
      const commits = repos.reduce((sum, r) => {
        if (filter === "commits") return sum + (r.commitFrequency ?? 0)
        return sum + Math.round((r.activeDaysRatio ?? 0) * 52 / 12)
      }, 0)
      return { month, commits: parseFloat(commits.toFixed(1)) }
    })
  }, [repos, filter])

  const isEmpty = repos.length === 0

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="font-bold text-gray-900">Activities</h3>
          <p className="text-xs text-gray-400 mt-0.5">Your weekly activity</p>
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as "commits" | "active_weeks")}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none text-gray-600"
        >
          <option value="commits">Commits</option>
          <option value="active_weeks">Active Weeks</option>
        </select>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <p className="text-sm text-gray-400">Belum ada data aktivitas</p>
          <p className="text-xs text-gray-300">Connect repository untuk melihat aktivitas</p>
        </div>
      ) : (
        <ChartContainer config={activityChartConfig} className="h-52 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={28} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="commits" fill="#00D964" radius={3} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </div>
  )
}
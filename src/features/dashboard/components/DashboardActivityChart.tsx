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

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

type Range = "1" | "3" | "6" | "12"

interface Props {
  repos: DashboardRepo[]
}

function getLastNMonths(n: number): { label: string; monthIndex: number }[] {
  const now    = new Date()
  const result = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({
      label:      MONTH_NAMES[d.getMonth()],
      monthIndex: d.getMonth(),
    })
  }
  return result
}

export function DashboardActivityChart({ repos }: Props) {
  const [range, setRange] = useState<Range>("6")

  const months = useMemo(() => getLastNMonths(parseInt(range)), [range])

  const data = useMemo(() => {
    if (repos.length === 0) return months.map(m => ({ month: m.label, commits: 0 }))

    return months.map(({ label, monthIndex }) => {
      const commits = repos.reduce((sum, r) => {
        return sum + (r.commitsPerMonth?.[monthIndex] ?? 0)
      }, 0)
      return { month: label, commits }
    })
  }, [repos, months])

  const isEmpty = repos.length === 0

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900">Activities</h3>
          <p className="text-xs text-gray-400 mt-0.5">Your weekly activity</p>
        </div>
        <select
          value={range}
          onChange={e => setRange(e.target.value as Range)}
          className="text-xs px-2 py-1 outline-none text-gray-600 bg-white"
        >
          <option value="1">Last Month</option>
          <option value="3">3 Months</option>
          <option value="6">6 Months</option>
          <option value="12">Last Year</option>
        </select>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <p className="text-sm text-gray-400">Belum ada data aktivitas</p>
          <p className="text-xs text-gray-300">Connect repository untuk melihat aktivitas</p>
        </div>
      ) : (
        <ChartContainer config={activityChartConfig} className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                interval={0}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={28} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar
                dataKey="commits"
                fill="#00D964"
                radius={3}
                barSize={range === "12" ? 24 : range === "6" ? 30 : 36}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </div>
  )
}
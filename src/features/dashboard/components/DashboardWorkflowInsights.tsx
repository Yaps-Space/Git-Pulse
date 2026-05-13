"use client"

import { useMemo, useState } from "react"
import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/shared/components/ui/chart"
import { type ChartConfig } from "@/shared/components/ui/chart"
import { DashboardRepo } from "../types"

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

type Range = "1" | "3" | "6" | "12"

const chartConfig = {
  commits:      { label: "Commits",         color: "#00D964" },
  pullRequests: { label: "Pull Request",    color: "#FFDF61" },
  issues:       { label: "Issues Activity", color: "#B6BBFF" },
} satisfies ChartConfig

function getLastNMonths(n: number): { label: string; monthIndex: number }[] {
  const now    = new Date()
  const result = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({ label: MONTH_NAMES[d.getMonth()], monthIndex: d.getMonth() })
  }
  return result
}

interface Props {
  repos: DashboardRepo[]
}

export function DashboardWorkflowInsights({ repos }: Props) {
  const [range, setRange] = useState<Range>("6")

  const months = useMemo(() => getLastNMonths(parseInt(range)), [range])

  const data = useMemo(() => {
    return months.map(({ label, monthIndex }) => {
      const commits      = repos.reduce((sum, r) => sum + (r.commitsPerMonth?.[monthIndex]  ?? 0), 0)
      const pullRequests = repos.reduce((sum, r) => sum + (r.prPerMonth?.[monthIndex]       ?? 0), 0)
      const issues       = repos.reduce((sum, r) => sum + (r.issuesPerMonth?.[monthIndex]   ?? 0), 0)
      return { month: label, commits, pullRequests, issues }
    })
  }, [repos, months])

  const isEmpty = repos.length === 0

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900">Workflow Insights</h3>
          <p className="text-xs text-gray-400 mt-0.5">Track commits, pull request, and issues activity</p>
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
        <div className="flex flex-col items-center justify-center flex-1 py-10 gap-2">
          <p className="text-sm text-gray-400">Belum ada data</p>
          <p className="text-xs text-gray-300">Connect repository untuk melihat data</p>
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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
              <ChartLegend content={<ChartLegendContent />} />
              <Line dataKey="commits"      stroke="#00D964" strokeWidth={2} dot={false} />
              <Line dataKey="pullRequests" stroke="#FFDF61" strokeWidth={2} dot={false} />
              <Line dataKey="issues"       stroke="#B6BBFF" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </div>
  )
}
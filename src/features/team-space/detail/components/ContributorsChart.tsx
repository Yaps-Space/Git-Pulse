"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/shared/components/ui/chart"
import { TeamMember } from "../../types/TeamSpace"
import { getLastNMonthLabels } from "../constants/TeamSpaceDetail"
import { MemberChart } from "./MemberChart"

const REPO_COLORS = ["#00D964", "#B6BBFF"]

interface Props {
  members:             TeamMember[]
  repoCommitsPerMonth: Record<string, number[]>
}

export function ContributorsChart({ members, repoCommitsPerMonth }: Props) {
  const labels  = getLastNMonthLabels(12)
  const entries = Object.entries(repoCommitsPerMonth)

  const sorted = [...members].sort((a, b) =>
    (b.commitsPerMonth?.reduce((x, y) => x + y, 0) ?? 0) -
    (a.commitsPerMonth?.reduce((x, y) => x + y, 0) ?? 0)
  )

  /**
   * Gabungkan semua repo ke satu array data per bulan untuk bar chart.
   * Setiap item: { month: "Jan", "owner/fe": 4, "owner/be": 2 }
   */
  const chartData = labels.map((month, i) => {
    const point: Record<string, string | number> = { month }
    entries.forEach(([repoName, counts]) => {
      point[repoName] = counts[i] ?? 0
    })
    return point
  })

  /**
   * Build ChartConfig dinamis dari daftar repo yang ada.
   * Label menggunakan nama repo saja (tanpa owner prefix).
   */
  const chartConfig = entries.reduce<ChartConfig>((acc, [repoName], i) => {
    const shortName = repoName.split("/").pop() ?? repoName
    acc[repoName]   = { label: shortName, color: REPO_COLORS[i] ?? "#888" }
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="mb-4">
          <h3 className="font-bold text-gray-900">Contributors</h3>
          <p className="text-xs text-gray-400">Contributions per month to main, excluding merge commits</p>
        </div>
        <ChartContainer config={chartConfig} className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={20}>
              <CartesianGrid vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  fontSize:     12,
                  borderRadius: 8,
                  border:       "none",
                  boxShadow:    "0 2px 8px rgba(0,0,0,0.1)",
                }}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              {/* Legend style shadcn hanya muncul kalau lebih dari 1 repo */}
              {entries.length > 1 && (
                <ChartLegend content={<ChartLegendContent />} />
              )}
              {entries.map(([repoName], i) => (
                <Bar
                  key={repoName}
                  dataKey={repoName}
                  fill={REPO_COLORS[i] ?? "#888"}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((member, i) => (
          <MemberChart key={member.id} member={member} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
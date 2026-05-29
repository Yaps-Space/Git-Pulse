"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts"
import { TeamMember } from "../../types/TeamSpace"
import { getLastNMonthLabels } from "../constants/TeamSpaceDetail"
import { MemberChart } from "./MemberChart"

interface Props {
  members:             TeamMember[]
  repoCommitsPerMonth: number[]
}

export function ContributorsChart({ members, repoCommitsPerMonth }: Props) {
  const labels = getLastNMonthLabels(12)

  const sorted = [...members].sort((a, b) =>
    (b.commitsPerMonth?.reduce((x, y) => x + y, 0) ?? 0) -
    (a.commitsPerMonth?.reduce((x, y) => x + y, 0) ?? 0)
  )

  const allData = labels.map((month, i) => ({
    month,
    commits: repoCommitsPerMonth[i] ?? 0,
  }))

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="mb-4">
          <h3 className="font-bold text-gray-900">Contributors</h3>
          <p className="text-xs text-gray-400">Contributions per month to main, excluding merge commits</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={allData} barSize={20}>
            <CartesianGrid vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={28} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Bar dataKey="commits" radius={[4, 4, 0, 0]}>
              {allData.map((_, i) => (
                <Cell key={i} fill="#00D964" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sorted.map((member, i) => (
          <MemberChart key={member.id} member={member} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
"use client"

import Image from "next/image"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts"
import { TeamMember } from "../../types/TeamSpace"
import { getLastNMonthLabels } from "../constants/TeamSpaceDetail"

interface Props {
  member: TeamMember
  rank:   number
}

export function MemberChart({ member, rank }: Props) {
  const labels = getLastNMonthLabels(12)

  const data = labels.map((month, i) => ({
    month,
    commits: member.commitsPerMonth?.[i] ?? 0,
  }))

  const totalCommits = member.commitsPerMonth?.reduce((a, b) => a + b, 0) ?? 0

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {member.userImage && (
            <Image src={member.userImage} alt={member.userName} width={32} height={32} className="rounded-full object-cover" />
          )}
          <div>
            <p className="font-semibold text-sm text-gray-900">{member.userName}</p>
            <p className="text-xs text-gray-400">{totalCommits} commits</p>
          </div>
        </div>
        <span className="text-sm font-bold text-gray-300">#{rank}</span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} barSize={8}>
          <CartesianGrid vertical={false} stroke="#f5f5f5" />
          <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
          />
          <Bar dataKey="commits" radius={[3, 3, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#00D964" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
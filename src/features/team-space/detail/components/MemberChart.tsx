"use client"

import Image from "next/image"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts"
import { TeamMember } from "../../types/TeamSpace"
import { getLastNMonthLabels } from "../constants/TeamSpaceDetail"
import { resolveMemberName } from "../helpers/resolveMemberName"

interface Props {
  member: TeamMember
  rank:   number
}

export function MemberChart({ member, rank }: Props) {
  const labels      = getLastNMonthLabels(12)
  const displayName = resolveMemberName(member)

  const data = labels.map((month, i) => ({
    month,
    commits: member.commitsPerMonth?.[i] ?? 0,
  }))

  const totalCommits = member.commitsPerMonth?.reduce((a, b) => a + b, 0) ?? 0

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {member.userImage ? (
            <Image
              src={member.userImage}
              alt={displayName}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-gray-500">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-semibold text-sm text-gray-900">{displayName}</p>
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
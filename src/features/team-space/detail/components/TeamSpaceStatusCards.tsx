"use client"

import { TeamMember } from "../../types/TeamSpace"
import { STATUS_COLOR, STATUS_STATS_CONFIG } from "../constants/TeamSpaceDetail"

interface Props {
  members: TeamMember[]
}

export function TeamSpaceStatusCards({ members }: Props) {
  const stats = STATUS_STATS_CONFIG.map(s => ({
    ...s,
    count: members.filter(m => m.status === s.key).length,
    color: STATUS_COLOR[s.key] ?? "#888",
  }))

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      {stats.map(({ label, count, color, description }) => (
        <div key={label} className="bg-gray-900 rounded-xl p-3 md:rounded-2xl md:p-5">
          <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3">{label}</p>
          <p className="text-2xl md:text-3xl font-bold mb-0.5" style={{ color }}>{count}</p>
          <p className="text-[10px] md:text-xs text-gray-500">Account</p>
          <p className="hidden md:block text-xs text-gray-500 mt-1">{description}</p>
        </div>
      ))}
    </div>
  )
}
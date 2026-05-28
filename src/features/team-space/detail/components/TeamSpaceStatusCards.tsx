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
    <div className="grid grid-cols-3 gap-4">
      {stats.map(({ label, count, color, description }) => (
        <div key={label} className="bg-gray-900 rounded-2xl p-5">
          <p className="text-sm text-gray-400 mb-3">{label}</p>
          <div className="flex items-end gap-2 mb-1">
            <p className="text-3xl font-bold" style={{ color }}>{count}</p>
            <p className="text-xs text-gray-500 mb-1">Account</p>
          </div>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      ))}
    </div>
  )
}
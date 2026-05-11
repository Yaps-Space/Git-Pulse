"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL } from "@/features/team-space/constants/TeamSpaceConfig"

interface Team {
  id:          string
  name:        string
  role:        string
  memberCount: number
}

interface Props {
  teams: Team[]
}

export function DashboardTeamSnapshot({ teams }: Props) {
  const visible = teams.slice(0, 5)

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Team Snapshot</h3>
        <Link href="/team-space" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          See All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-8 gap-2">
          <p className="text-sm text-gray-400">Belum ada team space</p>
          <Link href="/team-space" className="text-xs text-[#00D964] hover:underline">
            Gabung atau Buat Team
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {visible.map((team) => (
            <Link
              key={team.id}
              href={`/team-space/${team.id}`}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-1 h-full min-h-[2rem] rounded-full bg-[#00D964] flex-shrink-0 mt-1" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{team.name}</p>
                  <p className="text-xs text-gray-400">{team.memberCount} members</p>
                </div>
              </div>
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-3"
                style={{ background: ROLE_COLOR[team.role] ?? "#eee", color: ROLE_TEXT[team.role] ?? "#333" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_TEXT[team.role] ?? "#333" }} />
                {ROLE_LABEL[team.role] ?? team.role}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
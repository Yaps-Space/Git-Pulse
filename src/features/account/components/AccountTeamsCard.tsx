"use client"

import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";
import { Separator } from "@/shared/components/ui/separator";
import { ROLE_CONFIG } from "../constants/RoleTeams";
import { useTeams, Team } from "../hooks/UseTeams";
import { useIsMobile } from "@/shared/hooks/UseMobile";
import { EmptyTeams } from "./EmptyTeams";

type Role = keyof typeof ROLE_CONFIG;

const MAX_VISIBLE = 4;

function TeamItem({ id, name, role, memberCount }: Team) {
  const config = ROLE_CONFIG[role as Role] ?? ROLE_CONFIG.contributor
  return (
    <Link
      href={`/team-space/${id}`}
      className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors gap-2"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-1 self-stretch rounded-full bg-[#00D964] flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-400">{memberCount} members</p>
        </div>
      </div>
      <span
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full flex-shrink-0"
        style={{ background: config.bg, color: config.text }}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: config.dot }} />
        {config.label}
      </span>
    </Link>
  )
}

export function AccountTeamsCard() {
  const { teams }    = useTeams()
  const isMobile     = useIsMobile()
  const visibleTeams = teams.slice(0, MAX_VISIBLE);
  const isEmpty      = teams.length === 0;

  if (isMobile) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Tim yang Diikuti</h3>
          <Link
            href="/team-space"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Lihat Semua <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {isEmpty ? (
          <EmptyTeams />
        ) : (
          <div className="space-y-2">
            {visibleTeams.map((team) => (
              <TeamItem key={team.id} {...team} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-900">Team yang diikuti</h3>
        <Link
          href="/team-space"
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          See All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex items-center gap-1 mb-4.5">
        <Users className="w-3.5 h-3.5 text-gray-400" />
        <p className="text-sm text-gray-400">{teams.length} team</p>
      </div>

      <Separator className="mb-5" />

      <div className={`flex-1 flex flex-col ${isEmpty ? "justify-center" : "justify-start"}`}>
        {isEmpty ? (
          <EmptyTeams />
        ) : (
          <div className="space-y-2">
            {visibleTeams.map((team) => (
              <TeamItem key={team.id} {...team} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
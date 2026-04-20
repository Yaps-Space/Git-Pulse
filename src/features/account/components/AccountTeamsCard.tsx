"use client"

import { Users, ChevronRight } from "lucide-react";
import { Separator } from "@/shared/components/ui/separator";
import { ROLE_CONFIG } from "../constants/RoleTeams";
import Link from "next/link";
import { useTeams } from "../hooks/UseTeams";
import { EmptyTeams } from "./EmptyTeams";
import { TeamSkeleton } from "./TeamsSkeleton";

type Role = keyof typeof ROLE_CONFIG;

const MAX_VISIBLE = 4;

export function AccountTeamsCard() {
  const { teams, loading } = useTeams()
  const visibleTeams       = teams.slice(0, MAX_VISIBLE);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-900">Team yang diikuti</h3>
        <Link href="/team-space" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          See All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex items-center gap-1 mb-4.5">
        <Users className="w-3.5 h-3.5 text-gray-400" />
        <p className="text-sm text-gray-400">{loading ? "..." : `${teams.length} team`}</p>
      </div>

      <Separator className="mb-5" />

      <div className="flex-1 flex flex-col justify-center">
        {loading ? (
          <TeamSkeleton />
        ) : teams.length === 0 ? (
          <EmptyTeams />
        ) : (
          <div className="space-y-2">
            {visibleTeams.map(({ id, name, role, memberCount }) => {
              const config = ROLE_CONFIG[role as Role] ?? ROLE_CONFIG.contributor
              return (
                <div
                  key={id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                    <p className="text-sm text-gray-400">{memberCount} members</p>
                  </div>
                  <span
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full flex-shrink-0 ml-3"
                    style={{ background: config.bg, color: config.text }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: config.dot }}
                    />
                    {config.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
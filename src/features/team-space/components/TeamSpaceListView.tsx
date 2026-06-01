"use client"

import { useState } from "react"
import Link from "next/link"
import { Users, GitBranch, ChevronRight } from "lucide-react"
import { useTeamSpaces } from "../hooks/useTeamSpaces"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL } from "../constants/TeamSpaceConfig"
import TeamSpaceSearchActions from "./TeamSpaceActions"
import { EmptyState } from "./EmptyTeamSpace"

export default function TeamSpaceListView() {
  const { teamSpaces }      = useTeamSpaces()
  const [search, setSearch] = useState("")

  const filtered = teamSpaces.filter(ts =>
    ts.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <TeamSpaceSearchActions value={search} onChange={setSearch} />

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 gap-4 items-stretch">
          {filtered.map((ts) => (
            <Link
              key={ts.id}
              href={`/team-space/${ts.id}`}
              className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col border border-gray-100"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 truncate">{ts.name}</h3>
                </div>
                <span
                  className="ml-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                  style={{ background: ROLE_COLOR[ts.role] ?? "#eee", color: ROLE_TEXT[ts.role] ?? "#333" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_TEXT[ts.role] ?? "#333" }} />
                  {ROLE_LABEL[ts.role] ?? ts.role}
                </span>
              </div>

              <p className="text-sm text-gray-400 truncate mb-3 min-h-[1.25rem]">
                {ts.description ?? ""}
              </p>

              <div className="flex items-center justify-between gap-2 mt-auto">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-400">{ts.memberCount} Anggota</span>
                  </div>
                  {ts.repoName && (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <GitBranch className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-400 truncate">{ts.repoName}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-gray-400 flex-shrink-0">
                  Lihat Detail
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
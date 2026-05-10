"use client"

import { useState } from "react"
import Link from "next/link"
import { Users, GitBranch, Search, UserPlus, Plus } from "lucide-react"
import { useTeamSpaces } from "../hooks/useTeamSpaces"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL } from "../constants/TeamSpaceConfig"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { EmptyState } from "./EmptyTeamSpace"
import CreateTeamSpaceModal from "./CreateTeamSpaceModal"
import JoinTeamSpaceModal from "./JoinTeamSpaceModal"
import { cn } from "@/shared/lib/utils"

export default function TeamSpaceListMobile() {
  const { teamSpaces }            = useTeamSpaces()
  const [search,     setSearch]   = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin,   setShowJoin]   = useState(false)

  const filtered = teamSpaces.filter(ts =>
    ts.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="min-h-screen">
        <div className="bg-gray-900 px-5 pt-10 pb-6 rounded-b-3xl">
          <p className="text-gray-400 font-bold mb-4">Team Space</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari team space..."
                className="pl-9 h-10 bg-white/10 border-white/10 text-white placeholder:text-gray-400 text-sm"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-10 w-10 border-white/10 transition-colors flex-shrink-0",
                showJoin
                  ? "bg-[#00D964] text-gray-900 border-[#00D964]"
                  : "bg-white/10 text-white hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964]"
              )}
              onClick={() => setShowJoin(true)}
            >
              <UserPlus className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-10 w-10 border-white/10 transition-colors flex-shrink-0",
                showCreate
                  ? "bg-[#00D964] text-gray-900 border-[#00D964]"
                  : "bg-white/10 text-white hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964]"
              )}
              onClick={() => setShowCreate(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="px-4 pt-5 pb-6 flex flex-col gap-3">
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((ts) => (
              <Link
                key={ts.id}
                href={`/team-space/${ts.id}`}
                className="bg-white rounded-2xl p-5 flex flex-col border border-gray-100 active:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-gray-900 truncate">{ts.name}</h3>
                  </div>
                  <span
                    className="ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                    style={{ background: ROLE_COLOR[ts.role] ?? "#eee", color: ROLE_TEXT[ts.role] ?? "#333" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_TEXT[ts.role] ?? "#333" }} />
                    {ROLE_LABEL[ts.role] ?? ts.role}
                  </span>
                </div>

                {ts.description && (
                  <p className="text-sm text-gray-400 truncate mb-3">{ts.description}</p>
                )}

                <div className="flex items-center gap-4 mt-auto pt-2">
                  <div className="flex items-center gap-1.5">
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
              </Link>
            ))
          )}
        </div>
      </div>

      {showCreate && <CreateTeamSpaceModal onClose={() => setShowCreate(false)} />}
      {showJoin   && <JoinTeamSpaceModal   onClose={() => setShowJoin(false)}   />}
    </>
  )
}
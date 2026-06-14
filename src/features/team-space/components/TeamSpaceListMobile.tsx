"use client"

import { useState } from "react"
import Link from "next/link"
import { Users, GitBranch, Search, UserPlus, Plus, ChevronRight } from "lucide-react"
import { useTeamSpaces } from "../hooks/useTeamSpaces"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL } from "../constants/TeamSpaceConfig"
import { TeamSpaceRepoStats } from "./TeamSpaceRepoStats"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { EmptyState } from "./EmptyTeamSpace"
import CreateTeamSpaceModal from "./CreateTeamSpaceModal"
import JoinTeamSpaceModal from "./JoinTeamSpaceModal"
import { cn } from "@/shared/lib/utils"
import { MobilePageHeader } from "@/shared/components/commons/MobilePageHeader"

export default function TeamSpaceListMobile() {
  const { teamSpaces }              = useTeamSpaces()
  const [search,     setSearch]     = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin,   setShowJoin]   = useState(false)

  const filtered = teamSpaces.filter(ts =>
    ts.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="min-h-screen">
        <MobilePageHeader title="Team Space">
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
              variant="outline" size="icon"
              className={cn(
                "h-10 w-10 border-white/10 transition-colors flex-shrink-0",
                showJoin ? "bg-[#00D964] text-gray-900 border-[#00D964]"
                         : "bg-white/10 text-white hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964]"
              )}
              onClick={() => setShowJoin(true)}
            >
              <UserPlus className="w-4 h-4" />
            </Button>
            <Button
              variant="outline" size="icon"
              className={cn(
                "h-10 w-10 border-white/10 transition-colors flex-shrink-0",
                showCreate ? "bg-[#00D964] text-gray-900 border-[#00D964]"
                           : "bg-white/10 text-white hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964]"
              )}
              onClick={() => setShowCreate(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </MobilePageHeader>

        <div className="px-4 pt-5 pb-6 flex flex-col gap-3">
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((ts) => (
              <Link
                key={ts.id}
                href={`/team-space/${ts.id}`}
                className="bg-white rounded-2xl p-5 flex flex-col gap-3 border border-gray-100 active:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-gray-900 truncate">{ts.name}</h3>
                    <p className="text-xs text-gray-400 truncate mt-0.5 min-h-[1rem]">
                      {ts.description ?? ""}
                    </p>
                  </div>
                  <span
                    className="ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs flex-shrink-0"
                    style={{ background: ROLE_COLOR[ts.role] ?? "#eee", color: ROLE_TEXT[ts.role] ?? "#333" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_TEXT[ts.role] ?? "#333" }} />
                    {ROLE_LABEL[ts.role] ?? ts.role}
                  </span>
                </div>

                {/* Repo Stats */}
                <TeamSpaceRepoStats
                  healthScore       ={ts.healthScore}
                  healthGrade       ={ts.healthGrade}
                  productivityState ={ts.productivityState}
                />

                {/* Footer */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-50">
                  <div className="flex items-center gap-3 min-w-0">
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
                  <div className="flex items-center gap-0.5 text-xs font-medium text-gray-400 flex-shrink-0">
                    Lihat Detail
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
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
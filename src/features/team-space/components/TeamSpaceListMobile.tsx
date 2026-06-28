"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Users, GitBranch, Search, UserPlus, Plus, ChevronRight, SlidersHorizontal, X } from "lucide-react"
import { useTeamSpaces } from "../hooks/useTeamSpaces"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL } from "../constants/TeamSpaceConfig"
import { TeamSpaceRepoStats } from "./TeamSpaceRepoStats"
import { Input }   from "@/shared/components/ui/input"
import { Button }  from "@/shared/components/ui/button"
import { EmptyState } from "./EmptyTeamSpace"
import CreateTeamSpaceModal from "./CreateTeamSpaceModal"
import JoinTeamSpaceModal   from "./JoinTeamSpaceModal"
import { cn } from "@/shared/lib/utils"
import { MobilePageHeader } from "@/shared/components/commons/MobilePageHeader"
import { TeamSpaceFilterState } from "./TeamSpaceListView"
import { ShowPerPage } from "@/shared/components/commons/ShowPerPage"
import { Pagination }  from "@/shared/components/commons/Pagination"

const ROLE_OPTIONS = ["owner", "evaluator", "contributor"]
const ROLE_LABELS: Record<string, string> = {
  owner:       "Owner",
  evaluator:   "Evaluator",
  contributor: "Contributor",
}

interface Props {
  pageSize:   number
  onPageSize: (val: number) => void
}

export default function TeamSpaceListMobile({ pageSize, onPageSize }: Props) {
  const { teamSpaces }              = useTeamSpaces()
  const [search,     setSearch]     = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin,   setShowJoin]   = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters,    setFilters]    = useState<TeamSpaceFilterState>({ role: "", studyProgram: "", academicYear: "" })
  const [page,       setPage]       = useState(1)

  const studyPrograms = useMemo(() => [...new Set(teamSpaces.map(ts => ts.studyProgram).filter(Boolean))] as string[], [teamSpaces])
  const academicYears = useMemo(() => [...new Set(teamSpaces.map(ts => ts.academicYear).filter(Boolean))] as string[], [teamSpaces])

  const set = (key: keyof TeamSpaceFilterState, val: string) => {
    setFilters(prev => ({ ...prev, [key]: val }))
    setPage(1)
  }

  const hasActive = filters.role || filters.studyProgram || filters.academicYear

  const filtered = useMemo(() => teamSpaces.filter(ts => {
    if (search && !ts.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filters.role         && ts.role         !== filters.role)         return false
    if (filters.studyProgram && ts.studyProgram !== filters.studyProgram) return false
    if (filters.academicYear && ts.academicYear !== filters.academicYear) return false
    return true
  }), [teamSpaces, search, filters])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSearch   = (val: string) => { setSearch(val); setPage(1) }
  const handlePageSize = (val: number) => { onPageSize(val); setPage(1) }

  return (
    <>
      <div className="min-h-screen">
        <MobilePageHeader title="Team Space">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Cari team space..."
                className="pl-9 h-10 bg-white/10 border-white/10 text-white placeholder:text-gray-400 text-sm"
              />
            </div>

            <Button
              variant="outline" size="icon"
              onClick={() => setFilterOpen(true)}
              className={cn(
                "h-10 w-10 border-white/10 transition-colors flex-shrink-0",
                hasActive
                  ? "bg-[#00D964] text-gray-900 border-[#00D964]"
                  : "bg-white/10 text-white hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964]"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>

            <Button
              variant="outline" size="icon"
              className="h-10 w-10 border-white/10 bg-white/10 text-white hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964] transition-colors flex-shrink-0"
              onClick={() => setShowJoin(true)}
            >
              <UserPlus className="w-4 h-4" />
            </Button>

            <Button
              variant="outline" size="icon"
              className="h-10 w-10 border-white/10 bg-white/10 text-white hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964] transition-colors flex-shrink-0"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </MobilePageHeader>

        <div className="px-4 pt-5 pb-6 flex flex-col gap-3">
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
            <ShowPerPage
              variant="mobile"
              value={pageSize}
              onChange={handlePageSize}
            />
            <Pagination
              variant="mobile"
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>

          {paginated.length === 0 ? (
            <EmptyState />
          ) : (
            paginated.map((ts) => (
              <Link
                key={ts.id}
                href={`/team-space/${ts.id}`}
                className="bg-white rounded-2xl p-5 flex flex-col gap-3 border border-gray-100 active:shadow-md transition-shadow"
              >
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

                <TeamSpaceRepoStats
                  avgHealthScore={ts.avgHealthScore}
                  avgHealthGrade={ts.avgHealthGrade}
                  academicYear  ={ts.academicYear}
                  studyProgram  ={ts.studyProgram}
                  projectManager={ts.projectManager}
                />

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-400">{ts.memberCount} Anggota</span>
                    </div>
                    {ts.repoNames.length > 0 && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <GitBranch className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-400 truncate">
                          {ts.repoNames.length === 1
                            ? ts.repoNames[0]
                            : `${ts.repoNames[0]} +${ts.repoNames.length - 1}`}
                        </span>
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

      {filterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFilterOpen(false)} />
          <div className="relative bg-white rounded-t-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <p className="font-bold text-gray-900 text-base">Filter</p>
              <button
                onClick={() => setFilterOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</p>
                <div className="flex flex-wrap gap-2">
                  {["", ...ROLE_OPTIONS].map(r => (
                    <button
                      key={r}
                      onClick={() => set("role", r)}
                      className={cn(
                        "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                        filters.role === r
                          ? "border-[#00d964] bg-[#00d964]/10 text-gray-900"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                      )}
                    >
                      {r === "" ? "Semua" : ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>

              {studyPrograms.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Program Studi</p>
                  <div className="flex flex-wrap gap-2">
                    {["", ...studyPrograms].map(sp => (
                      <button
                        key={sp}
                        onClick={() => set("studyProgram", sp)}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                          filters.studyProgram === sp
                            ? "border-[#00d964] bg-[#00d964]/10 text-gray-900"
                            : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                        )}
                      >
                        {sp === "" ? "Semua" : sp}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {academicYears.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tahun Ajaran</p>
                  <div className="flex flex-wrap gap-2">
                    {["", ...academicYears].map(ay => (
                      <button
                        key={ay}
                        onClick={() => set("academicYear", ay)}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                          filters.academicYear === ay
                            ? "border-[#00d964] bg-[#00d964]/10 text-gray-900"
                            : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                        )}
                      >
                        {ay === "" ? "Semua" : ay}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 pb-6 pt-2 flex gap-3 border-t border-gray-100">
              {hasActive && (
                <Button
                  variant="outline"
                  className="flex-1 h-10 font-semibold border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  onClick={() => setFilters({ role: "", studyProgram: "", academicYear: "" })}
                >
                  Reset
                </Button>
              )}
              <Button
                className="flex-1 h-10 bg-[#00D964] hover:bg-[#00c057] text-gray-900 font-semibold border-0"
                onClick={() => setFilterOpen(false)}
              >
                Terapkan
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCreate && <CreateTeamSpaceModal onClose={() => setShowCreate(false)} />}
      {showJoin   && <JoinTeamSpaceModal   onClose={() => setShowJoin(false)}   />}
    </>
  )
}
"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Users, GitBranch, ChevronRight } from "lucide-react"
import { useTeamSpaces } from "../hooks/useTeamSpaces"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL } from "../constants/TeamSpaceConfig"
import { TeamSpaceRepoStats } from "./TeamSpaceRepoStats"
import TeamSpaceSearchActions from "./TeamSpaceActions"
import { EmptyState } from "./EmptyTeamSpace"
import { Pagination } from "@/shared/components/commons/Pagination"

export interface TeamSpaceFilterState {
  role:         string
  studyProgram: string
  academicYear: string
}

interface Props {
  pageSize:   number
  onPageSize: (val: number) => void
}

function applyFilters(teamSpaces: ReturnType<typeof useTeamSpaces>["teamSpaces"], search: string, filters: TeamSpaceFilterState) {
  return teamSpaces.filter(ts => {
    if (search && !ts.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filters.role         && ts.role         !== filters.role)         return false
    if (filters.studyProgram && ts.studyProgram !== filters.studyProgram) return false
    if (filters.academicYear && ts.academicYear !== filters.academicYear) return false
    return true
  })
}

export default function TeamSpaceListView({ pageSize, onPageSize }: Props) {
  const { teamSpaces }      = useTeamSpaces()
  const [search,  setSearch]  = useState("")
  const [filters, setFilters] = useState<TeamSpaceFilterState>({ role: "", studyProgram: "", academicYear: "" })
  const [page,    setPage]    = useState(1)

  const studyPrograms  = useMemo(() => [...new Set(teamSpaces.map(ts => ts.studyProgram).filter(Boolean))] as string[], [teamSpaces])
  const academicYears  = useMemo(() => [...new Set(teamSpaces.map(ts => ts.academicYear).filter(Boolean))] as string[], [teamSpaces])
  const filtered       = useMemo(() => applyFilters(teamSpaces, search, filters), [teamSpaces, search, filters])
  const totalPages      = Math.ceil(filtered.length / pageSize)
  const paginated       = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSearch = (val: string) => { setSearch(val); setPage(1) }
  const handleFilter = (f: TeamSpaceFilterState) => { setFilters(f); setPage(1) }
  const handlePageSize = (val: number) => { onPageSize(val); setPage(1) }

  return (
    <div className="flex flex-col gap-6">
      <TeamSpaceSearchActions
        value        ={search}
        filters      ={filters}
        pageSize     ={pageSize}
        onChange     ={handleSearch}
        onFilter     ={handleFilter}
        onPageSize   ={handlePageSize}
        studyPrograms={studyPrograms}
        academicYears={academicYears}
      />

      {paginated.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 items-stretch">
            {paginated.map((ts) => (
              <Link
                key={ts.id}
                href={`/team-space/${ts.id}`}
                className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col gap-3 border border-gray-100"
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

                <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-gray-50">
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
            ))}
          </div>

          {totalPages > 1 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
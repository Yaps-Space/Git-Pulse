"use client"

import { useState } from "react"
import { Search, ArrowUpDown, SlidersHorizontal } from "lucide-react"
import { Input }       from "@/shared/components/ui/input"
import { Button }      from "@/shared/components/ui/button"
import { ShowPerPage } from "@/shared/components/commons/ShowPerPage"
import { Pagination }  from "@/shared/components/commons/Pagination"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { TeamSpaceMemberCard }     from "./TeamSpaceMemberCard"
import { MemberFilterSheet, MemberFilterState } from "./MemberFilterSheet"
import { SORTABLE_MEMBER_COLUMNS } from "../constants/SortableMember"
import { sortMembers }             from "../helpers/sortMembers"
import { TeamMember }              from "../../types/TeamSpace"
import { TeamSpaceDetail }         from "../types/TeamSpaceDetail"
import { SortKey, SortDir }        from "../types/TeamSpaceMember"
import { capitalizeFirst }         from "@/shared/helpers"
import { cn }                      from "@/shared/lib/utils"

interface Props {
  members:             TeamMember[]
  myRole:              string
  classId:             string
  onMutate:            (fn: (data: TeamSpaceDetail) => TeamSpaceDetail) => void
  showSearchAndFilter: boolean
}

export function TeamSpaceMemberList({ members, myRole, classId, onMutate, showSearchAndFilter }: Props) {
  const [search,     setSearch]     = useState("")
  const [pageSize,   setPageSize]   = useState(10)
  const [page,       setPage]       = useState(1)
  const [sortKey,    setSortKey]    = useState<SortKey>("displayName")
  const [sortDir,    setSortDir]    = useState<SortDir>("asc")
  const [sortOpen,   setSortOpen]   = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters,    setFilters]    = useState<MemberFilterState>({ role: "", status: "" })

  const handleSearch   = (val: string) => { setSearch(val);   setPage(1) }
  const handlePageSize = (val: number) => { setPageSize(val); setPage(1) }
  const handleFilter    = (f: MemberFilterState) => { setFilters(f); setPage(1) }

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
    setPage(1)
  }

  const handleAnalyze = (memberId: string) => {
    onMutate(data => ({
      ...data,
      members: data.members.map(m => m.id === memberId ? { ...m, status: "analyzing" } : m),
    }))
  }

  const handleKick = (memberId: string) => {
    onMutate(data => ({
      ...data,
      members: data.members.filter(m => m.id !== memberId),
    }))
  }

  const handleRoleChange = (memberId: string, role: string) => {
    onMutate(data => ({
      ...data,
      members: data.members.map(m => m.id === memberId ? { ...m, role } : m),
    }))
  }

  const filtered = members.filter(m => {
    const displayName = (m.displayName ?? m.userName).toLowerCase()
    const login        = (m.userLogin ?? "").toLowerCase()
    const q             = search.toLowerCase()
    const matchesSearch = displayName.includes(q) || login.includes(q)
    const matchesRole   = !filters.role   || m.role === filters.role
    const matchesStatus = !filters.status || capitalizeFirst(m.status) === filters.status
    return matchesSearch && matchesRole && matchesStatus
  })

  const sorted     = sortMembers(filtered, sortKey, sortDir)
  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize)
  const hasFilters = !!(filters.role || filters.status)

  return (
    <div className="flex flex-col gap-3">
      {showSearchAndFilter && (
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search anggota..."
              className="pl-9 h-10 bg-white border-gray-200 text-sm"
            />
          </div>

          <DropdownMenu onOpenChange={setSortOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-10 w-10 flex-shrink-0 border-gray-200 transition-colors",
                  sortOpen
                    ? "text-gray-900 border-gray-300 bg-white"
                    : "bg-white text-gray-900 hover:bg-[#00D964]"
                )}
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              {SORTABLE_MEMBER_COLUMNS.map(col => (
                <DropdownMenuItem
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={cn(
                    "flex items-center justify-between text-sm cursor-pointer",
                    col.key === sortKey && "font-semibold bg-gray-50"
                  )}
                >
                  {col.label}
                  {col.key === sortKey && (
                    <span className="text-xs text-gray-400">
                      {sortDir === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setFilterOpen(true)}
            className={cn(
              "h-10 w-10 flex-shrink-0 border-gray-200 transition-colors relative",
              hasFilters
                ? "text-gray-900 border-[#00D964] bg-[#00d964] hover:bg-[#00d964]"
                : "bg-white text-gray-900 hover:bg-[#00D964]"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
        {showSearchAndFilter && (
          <>
            <ShowPerPage variant="mobile" value={pageSize} onChange={handlePageSize} />
            <Pagination variant="mobile" page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
        <div className="mt-2.5 flex flex-col gap-2">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="font-medium text-gray-700">Tidak ada anggota ditemukan</p>
            </div>
          ) : (
            paginated.map((member, idx) => (
              <TeamSpaceMemberCard
                key={member.id}
                member={member}
                index={(page - 1) * pageSize + idx + 1}
                myRole={myRole}
                classId={classId}
                onAnalyze={() => handleAnalyze(member.id)}
                onKick={() => handleKick(member.id)}
                onRoleChange={role => handleRoleChange(member.id, role)}
              />
            ))
          )}
        </div>
      </div>

      <MemberFilterSheet
        open={filterOpen}
        filters={filters}
        onClose={() => setFilterOpen(false)}
        onFilter={handleFilter}
      />
    </div>
  )
}
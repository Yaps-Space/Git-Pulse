"use client"

import { useState } from "react"
import { Search, UserPlus, Plus, SlidersHorizontal } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input }  from "@/shared/components/ui/input"
import { ShowPerPage } from "@/shared/components/commons/ShowPerPage"
import CreateTeamSpaceModal from "./CreateTeamSpaceModal"
import JoinTeamSpaceModal   from "./JoinTeamSpaceModal"
import { TeamSpaceFilterSheet } from "./TeamSpaceFilterSheet"
import { cn } from "@/shared/lib/utils"
import { TeamSpaceFilterState } from "./TeamSpaceListView"

interface Props {
  value:         string
  filters:       TeamSpaceFilterState
  pageSize:      number
  onChange:      (value: string) => void
  onFilter:      (f: TeamSpaceFilterState) => void
  onPageSize:    (value: number) => void
  studyPrograms: string[]
  academicYears: string[]
}

export default function TeamSpaceSearchActions({ value, filters, pageSize, onChange, onFilter, onPageSize, studyPrograms, academicYears }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin,   setShowJoin]   = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const hasActive = filters.role || filters.studyProgram || filters.academicYear

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Cari team space..."
            className="pl-9 h-10 bg-white border-gray-200 text-sm"
          />
        </div>

        <ShowPerPage value={pageSize} onChange={onPageSize} />

        <button
          onClick={() => setFilterOpen(true)}
          className={cn(
            "flex items-center justify-center gap-2 h-10 w-28 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 outline-none hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964] transition-colors",
            hasActive && "border-[#00d964] bg-[#00d964] text-gray-900"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter
        </button>

        <Button
          variant="outline"
          className="h-10 w-28 gap-2 border-gray-200 bg-white text-gray-700 hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964] transition-colors"
          onClick={() => setShowJoin(true)}
        >
          <UserPlus className="w-4 h-4" />
          Join
        </Button>

        <Button
          variant="outline"
          className="h-10 w-28 gap-2 border-gray-200 bg-white text-gray-700 hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964] transition-colors"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="w-4 h-4" />
          Create
        </Button>
      </div>

      <TeamSpaceFilterSheet
        open={filterOpen}
        filters={filters}
        studyPrograms={studyPrograms}
        academicYears={academicYears}
        onClose={() => setFilterOpen(false)}
        onFilter={onFilter}
      />

      {showCreate && <CreateTeamSpaceModal onClose={() => setShowCreate(false)} />}
      {showJoin   && <JoinTeamSpaceModal   onClose={() => setShowJoin(false)}   />}
    </>
  )
}
"use client"

import { useState } from "react"
import { Search, UserPlus, Plus, SlidersHorizontal, ChevronDown, X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input }  from "@/shared/components/ui/input"
import { ShowPerPage } from "@/shared/components/commons/ShowPerPage"
import CreateTeamSpaceModal from "./CreateTeamSpaceModal"
import JoinTeamSpaceModal   from "./JoinTeamSpaceModal"
import { cn } from "@/shared/lib/utils"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { TeamSpaceFilterState } from "./TeamSpaceListView"

const ROLE_OPTIONS = ["owner", "evaluator", "contributor"]
const ROLE_LABELS: Record<string, string> = {
  owner:       "Owner",
  evaluator:   "Evaluator",
  contributor: "Contributor",
}

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

  const set = (key: keyof TeamSpaceFilterState, val: string) =>
    onFilter({ ...filters, [key]: val })

  const hasActive = filters.role || filters.studyProgram || filters.academicYear

  const triggerClass = (active: boolean) => cn(
    "flex items-center justify-between gap-2 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 outline-none hover:border-gray-300 transition-colors",
    active && "border-[#00d964] bg-[#00d964]/10 text-gray-900"
  )

  return (
    <>
      <div className="flex flex-col gap-2">
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
            onClick={() => setFilterOpen(prev => !prev)}
            className={cn(
              "flex items-center justify-center gap-2 h-10 w-28 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 outline-none hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964] transition-colors",
              (filterOpen || hasActive) && "border-[#00d964] bg-[#00d964] text-gray-900"
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

        {filterOpen && (
          <div className="flex items-center gap-2 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={triggerClass(!!filters.role)}>
                  <span>{filters.role ? ROLE_LABELS[filters.role] ?? filters.role : "Role"}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[140px]">
                <DropdownMenuItem onClick={() => set("role", "")} className={cn("text-sm", !filters.role && "font-semibold bg-gray-50")}>
                  Semua
                </DropdownMenuItem>
                {ROLE_OPTIONS.map(r => (
                  <DropdownMenuItem
                    key={r}
                    onClick={() => set("role", r)}
                    className={cn("text-sm", filters.role === r && "font-semibold bg-gray-50")}
                  >
                    {ROLE_LABELS[r]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={triggerClass(!!filters.studyProgram)}>
                  <span className="truncate max-w-[120px]">{filters.studyProgram || "Program Studi"}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[180px]">
                <DropdownMenuItem onClick={() => set("studyProgram", "")} className={cn("text-sm", !filters.studyProgram && "font-semibold bg-gray-50")}>
                  Semua
                </DropdownMenuItem>
                {studyPrograms.map(sp => (
                  <DropdownMenuItem
                    key={sp}
                    onClick={() => set("studyProgram", sp)}
                    className={cn("text-sm", filters.studyProgram === sp && "font-semibold bg-gray-50")}
                  >
                    {sp}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={triggerClass(!!filters.academicYear)}>
                  <span className="truncate max-w-[120px]">{filters.academicYear || "Tahun Ajaran"}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[160px]">
                <DropdownMenuItem onClick={() => set("academicYear", "")} className={cn("text-sm", !filters.academicYear && "font-semibold bg-gray-50")}>
                  Semua
                </DropdownMenuItem>
                {academicYears.map(ay => (
                  <DropdownMenuItem
                    key={ay}
                    onClick={() => set("academicYear", ay)}
                    className={cn("text-sm", filters.academicYear === ay && "font-semibold bg-gray-50")}
                  >
                    {ay}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {hasActive && (
              <button
                onClick={() => onFilter({ role: "", studyProgram: "", academicYear: "" })}
                className="flex items-center gap-1.5 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {showCreate && <CreateTeamSpaceModal onClose={() => setShowCreate(false)} />}
      {showJoin   && <JoinTeamSpaceModal   onClose={() => setShowJoin(false)}   />}
    </>
  )
}
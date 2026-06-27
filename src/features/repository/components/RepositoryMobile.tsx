"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Plus, SlidersHorizontal, X, ArrowUpDown } from "lucide-react"
import { Input }   from "@/shared/components/ui/input"
import { Button }  from "@/shared/components/ui/button"
import { MobilePageHeader }   from "@/shared/components/commons/MobilePageHeader"
import { RepoMobileList }     from "./RepoMobileList"
import { GitHubIcon, GitLabIcon } from "@/shared/components/commons/ProviderIcons"
import { cn }      from "@/shared/lib/utils"
import { Repo, SortKey, SortDir } from "../types"
import { FilterState }  from "./RepositoryLayout"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { SORTABLE_COLUMNS } from "../constants/Sortable"

const PRODUCTIVITY_OPTIONS = ["active", "inactive", "new"]
const GRADE_OPTIONS        = ["A", "B", "C", "D", "F"]

interface Props {
  repos:    Repo[]
  filters:  FilterState
  onFilter: (f: FilterState) => void
}

export function RepositoryMobile({ repos, filters, onFilter }: Props) {
  const [search,     setSearch]     = useState("")
  const [sortKey,    setSortKey]    = useState<SortKey>("analyzedAt")
  const [sortDir,    setSortDir]    = useState<SortDir>("desc")
  const [pageSize,   setPageSize]   = useState(10)
  const [filterOpen, setFilterOpen] = useState(false)

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("desc") }
  }

  const set = (key: keyof FilterState, val: string) =>
    onFilter({ ...filters, [key]: val })

  const hasActive = filters.provider || filters.productivity || filters.grade

  return (
    <div className="min-h-screen">
      <MobilePageHeader title="Repository">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 h-10 bg-white/10 border-white/10 text-white placeholder:text-gray-400 text-sm"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon"
                className="h-10 w-10 border-white/10 bg-white/10 text-white hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964] transition-colors flex-shrink-0">
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              {SORTABLE_COLUMNS.map(col => (
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
                    <span className="text-xs text-gray-400">{sortDir === "asc" ? "↑" : "↓"}</span>
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
              "h-10 w-10 border-white/10 bg-white/10 text-white hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964] transition-colors flex-shrink-0",
              hasActive && "bg-[#00D964] text-gray-900 border-[#00D964]"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>

          <Button asChild variant="outline" size="icon"
            className="h-10 w-10 border-white/10 bg-white/10 text-white hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964] transition-colors flex-shrink-0">
            <Link href="/repository/connect">
              <Plus className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </MobilePageHeader>

      <RepoMobileList
        repos={repos}
        search={search}
        sortKey={sortKey}
        sortDir={sortDir}
        pageSize={pageSize}
        onPageSize={setPageSize}
      />

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
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Provider</p>
                <div className="flex gap-2">
                  {(["", "github", "gitlab"] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => set("provider", p)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                        filters.provider === p
                          ? "border-[#00d964] bg-[#00d964]/10 text-gray-900"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                      )}
                    >
                      {p === "github" && <GitHubIcon className="w-3.5 h-3.5 text-gray-600" />}
                      {p === "gitlab" && <GitLabIcon className="w-3.5 h-3.5 text-[#fc6d26]" />}
                      {p === "" ? "Semua" : p === "github" ? "GitHub" : "GitLab"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Productivity</p>
                <div className="flex flex-wrap gap-2">
                  {["", ...PRODUCTIVITY_OPTIONS].map(p => (
                    <button
                      key={p}
                      onClick={() => set("productivity", p)}
                      className={cn(
                        "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                        filters.productivity === p
                          ? "border-[#00d964] bg-[#00d964]/10 text-gray-900"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                      )}
                    >
                      {p === "" ? "Semua" : p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Grade</p>
                <div className="flex flex-wrap gap-2">
                  {["", ...GRADE_OPTIONS].map(g => (
                    <button
                      key={g}
                      onClick={() => set("grade", g)}
                      className={cn(
                        "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                        filters.grade === g
                          ? "border-[#00d964] bg-[#00d964]/10 text-gray-900"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                      )}
                    >
                      {g === "" ? "Semua" : `Grade ${g}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 pb-6 pt-2 flex gap-3 border-t border-gray-100">
              {hasActive && (
                <Button
                  variant="outline"
                  className="flex-1 h-10 font-semibold border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  onClick={() => onFilter({ provider: "", productivity: "", grade: "" })}
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
    </div>
  )
}
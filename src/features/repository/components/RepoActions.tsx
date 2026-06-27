"use client"

import { useState } from "react"
import { Search, Plus, SlidersHorizontal, ChevronDown, X } from "lucide-react"
import Link from "next/link"
import { Input }  from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { ShowPerPage } from "@/shared/components/commons/ShowPerPage"
import { GitHubIcon, GitLabIcon } from "@/shared/components/commons/ProviderIcons"
import { FilterState } from "./RepositoryLayout"
import { cn } from "@/shared/lib/utils"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

const PRODUCTIVITY_OPTIONS = ["active", "inactive", "new"]
const GRADE_OPTIONS        = ["A", "B", "C", "D", "F"]

interface Props {
  value:      string
  pageSize:   number
  filters:    FilterState
  onSearch:   (value: string) => void
  onPageSize: (value: number) => void
  onFilter:   (f: FilterState) => void
}

export function RepoActions({ value, pageSize, filters, onSearch, onPageSize, onFilter }: Props) {
  const [filterOpen, setFilterOpen] = useState(false)

  const set = (key: keyof FilterState, val: string) =>
    onFilter({ ...filters, [key]: val })

  const hasActive = filters.provider || filters.productivity || filters.grade

  const dropdownTriggerClass = (active: boolean) => cn(
    "flex items-center justify-between gap-2 h-10 w-38 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 outline-none hover:border-gray-300 transition-colors",
    active && "border-[#00d964] bg-[#00d964]/10 text-gray-900"
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={value}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search"
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
          {hasActive && <span className="w-1.5 h-1.5 rounded-full bg-[#00d964]" />}
        </button>

        <Button
          asChild
          variant="outline"
          className="h-10 w-28 gap-2 border-gray-200 bg-white text-gray-700 hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964] transition-colors"
        >
          <Link href="/repository/connect">
            <Plus className="w-4 h-4" />
            Connect
          </Link>
        </Button>
      </div>

      {filterOpen && (
        <div className="flex items-center gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={dropdownTriggerClass(!!filters.provider)}>
                <span className="flex items-center gap-2">
                  {filters.provider === "github" && <GitHubIcon className="w-3.5 h-3.5 text-gray-600" />}
                  {filters.provider === "gitlab" && <GitLabIcon className="w-3.5 h-3.5 text-[#fc6d26]" />}
                  {filters.provider === "github" ? "GitHub" : filters.provider === "gitlab" ? "GitLab" : "Repository"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[140px]">
              <DropdownMenuItem onClick={() => set("provider", "")} className={cn("gap-2 text-sm", !filters.provider && "font-semibold bg-gray-50")}>
                Semua
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => set("provider", "github")} className={cn("gap-2 text-sm", filters.provider === "github" && "font-semibold bg-gray-50")}>
                <GitHubIcon className="w-3.5 h-3.5 text-gray-600" />
                GitHub
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => set("provider", "gitlab")} className={cn("gap-2 text-sm", filters.provider === "gitlab" && "font-semibold bg-gray-50")}>
                <GitLabIcon className="w-3.5 h-3.5 text-[#fc6d26]" />
                GitLab
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={dropdownTriggerClass(!!filters.productivity)}>
                <span>
                  {filters.productivity
                    ? filters.productivity.charAt(0).toUpperCase() + filters.productivity.slice(1)
                    : "Productivity"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[140px]">
              <DropdownMenuItem onClick={() => set("productivity", "")} className={cn("text-sm", !filters.productivity && "font-semibold bg-gray-50")}>
                Semua
              </DropdownMenuItem>
              {PRODUCTIVITY_OPTIONS.map(p => (
                <DropdownMenuItem
                  key={p}
                  onClick={() => set("productivity", p)}
                  className={cn("text-sm", filters.productivity === p && "font-semibold bg-gray-50")}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={dropdownTriggerClass(!!filters.grade)}>
                <span>{filters.grade ? `Grade ${filters.grade}` : "Grade"}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[120px]">
              <DropdownMenuItem onClick={() => set("grade", "")} className={cn("text-sm", !filters.grade && "font-semibold bg-gray-50")}>
                Semua
              </DropdownMenuItem>
              {GRADE_OPTIONS.map(g => (
                <DropdownMenuItem
                  key={g}
                  onClick={() => set("grade", g)}
                  className={cn("text-sm", filters.grade === g && "font-semibold bg-gray-50")}
                >
                  Grade {g}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActive && (
            <button
              onClick={() => onFilter({ provider: "", productivity: "", grade: "" })}
              className="flex items-center gap-1.5 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  )
}
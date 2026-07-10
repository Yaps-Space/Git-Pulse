"use client"

import { useState } from "react"
import { Search, Plus, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { Input }  from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { ShowPerPage } from "@/shared/components/commons/ShowPerPage"
import { FilterSheet } from "./FilterSheet"
import { FilterState } from "./RepositoryLayout"
import { cn } from "@/shared/lib/utils"

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

  const hasActive = filters.provider || filters.productivity || filters.grade

  return (
    <>
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

      <FilterSheet
        open={filterOpen}
        filters={filters}
        onClose={() => setFilterOpen(false)}
        onFilter={onFilter}
      />
    </>
  )
}
"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Plus, SlidersHorizontal } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { MobilePageHeader } from "@/shared/components/commons/MobilePageHeader"
import { RepoMobileList }   from "./RepoMobileList"
import { cn } from "@/shared/lib/utils"
import { Repo, SortKey, SortDir } from "../types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { SORTABLE_COLUMNS } from "../constants/Sortable"

interface Props {
  repos: Repo[]
}

export function RepositoryMobile({ repos }: Props) {
  const [search,   setSearch]   = useState("")
  const [sortKey,  setSortKey]  = useState<SortKey>("analyzedAt")
  const [sortDir,  setSortDir]  = useState<SortDir>("desc")
  const [pageSize, setPageSize] = useState(10)

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("desc") }
  }

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
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 border-white/10 bg-white/10 text-white hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964] transition-colors flex-shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" />
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
                    <span className="text-xs text-gray-400">
                      {sortDir === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-10 w-10 border-white/10 bg-white/10 text-white hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964] transition-colors flex-shrink-0"
          >
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
    </div>
  )
}
"use client"

import { Search, Filter, AlertCircle, X } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { MobilePageHeader } from "@/shared/components/commons/MobilePageHeader"
import { ShowPerPage } from "@/shared/components/commons/ShowPerPage"
import { Pagination } from "@/shared/components/commons/Pagination"
import { ConnectRepoList } from "./ConnectRepoList"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { FILTER_OPTIONS } from "../constants/ConnectFilter"
import { cn } from "@/shared/lib/utils"
import { GithubRepo } from "../types"

interface Props {
  search:         string
  filter:         string
  pageSize:       number
  page:           number
  totalPages:     number
  paginated:      GithubRepo[]
  connecting:     string | null
  error:          string
  onSearch:       (val: string) => void
  onFilter:       (val: string) => void
  onPageSize:     (val: number) => void
  onPageChange:   (val: number) => void
  onConnect:      (repo: GithubRepo) => void
  onDismissError: () => void
}

export function ConnectMobile({
  search, filter, pageSize, page, totalPages, paginated,
  connecting, error,
  onSearch, onFilter, onPageSize, onPageChange, onConnect, onDismissError,
}: Props) {
  return (
    <div className="min-h-screen">
      <MobilePageHeader title="Connect Repository" backHref="/repository">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={e => onSearch(e.target.value)}
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
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              {FILTER_OPTIONS.map(o => (
                <DropdownMenuItem
                  key={o.value}
                  onClick={() => onFilter(o.value)}
                  className={cn(
                    "text-sm cursor-pointer",
                    o.value === filter && "font-semibold bg-gray-50"
                  )}
                >
                  {o.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </MobilePageHeader>

      <div className="px-4 pt-5 pb-6 flex flex-col gap-3">
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
          <ShowPerPage
            variant="mobile"
            value={pageSize}
            onChange={val => { onPageSize(val); onPageChange(1) }}
          />
          <Pagination
            variant="mobile"
            page={page}
            totalPages={totalPages}
            onChange={onPageChange}
          />
        </div>

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-500 flex-1">{error}</p>
            <button onClick={onDismissError}>
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}

        <ConnectRepoList
          variant="mobile"
          paginated={paginated}
          page={page}
          totalPages={totalPages}
          connecting={connecting}
          onConnect={onConnect}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  )
}
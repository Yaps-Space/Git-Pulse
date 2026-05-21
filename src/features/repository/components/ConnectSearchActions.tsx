"use client"

import { Search, ChevronDown } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import { ShowPerPage } from "@/shared/components/commons/ShowPerPage"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { FILTER_OPTIONS } from "../constants/ConnectFilter"
import { cn } from "@/shared/lib/utils"

interface Props {
  search:     string
  pageSize:   number
  filter:     string
  onSearch:   (val: string) => void
  onPageSize: (val: number) => void
  onFilter:   (val: string) => void
}

export function ConnectSearchActions({ search, pageSize, filter, onSearch, onPageSize, onFilter }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search"
          className="pl-9 h-10 bg-white border-gray-200 text-sm"
        />
      </div>

      <ShowPerPage value={pageSize} onChange={onPageSize} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center justify-between w-28 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 outline-none hover:border-gray-300 transition-colors">
            <span className="text-gray-900">Filter</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[112px]">
          {FILTER_OPTIONS.map(o => (
            <DropdownMenuItem
              key={o.value}
              onClick={() => onFilter(o.value)}
              className={cn(
                "justify-between text-sm cursor-pointer",
                o.value === filter && "font-semibold text-gray-900 bg-gray-50"
              )}
            >
              {o.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
"use client"

import { Search, ChevronDown, Check } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import { ShowPerPage } from "@/shared/components/commons/ShowPerPage"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { FILTER_OPTIONS } from "../constants/ConnectFilter"

interface Props {
  search:     string
  pageSize:   number
  filter:     string
  onSearch:   (val: string) => void
  onPageSize: (val: number) => void
  onFilter:   (val: string) => void
}

export function ConnectSearchActions({ search, pageSize, filter, onSearch, onPageSize, onFilter }: Props) {
  const activeLabel = FILTER_OPTIONS.find(o => o.value === filter)?.label ?? "Semua"

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
          <button className="flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 outline-none hover:border-gray-300 transition-colors">
            <span>{activeLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[140px]">
          {FILTER_OPTIONS.map(o => (
            <DropdownMenuItem
              key={o.value}
              onClick={() => onFilter(o.value)}
              className="flex items-center justify-between text-sm cursor-pointer"
            >
              {o.label}
              {o.value === filter && <Check className="w-3.5 h-3.5 text-gray-700" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
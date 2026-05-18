"use client"

import { Search, Plus } from "lucide-react"
import Link from "next/link"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { ShowPerPage } from "@/shared/components/commons/ShowPerPage"

interface Props {
  value:      string
  pageSize:   number
  onSearch:   (value: string) => void
  onPageSize: (value: number) => void
}

export function RepoActions({ value, pageSize, onSearch, onPageSize }: Props) {
  return (
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
  )
}
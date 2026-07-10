"use client"

import { Search, ChevronDown, SlidersHorizontal } from "lucide-react"
import { Input }  from "@/shared/components/ui/input"
import { ShowPerPage } from "@/shared/components/commons/ShowPerPage"
import { GitHubIcon, GitLabIcon } from "@/shared/components/commons/ProviderIcons"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { FILTER_OPTIONS } from "../constants/ConnectFilter"
import { cn } from "@/shared/lib/utils"
import { Provider } from "@/features/repository/types"

interface Props {
  search:          string
  pageSize:        number
  filter:          string
  provider:        Provider
  githubConnected: boolean
  gitlabConnected: boolean
  onSearch:        (val: string) => void
  onPageSize:      (val: number) => void
  onFilter:        (val: string) => void
  onProvider:      (p: Provider) => void
}

export function ConnectSearchActions({
  search, pageSize, filter, provider,
  githubConnected, gitlabConnected,
  onSearch, onPageSize, onFilter, onProvider,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Cari repository..."
          className="pl-9 h-10 bg-white border-gray-200 text-sm"
        />
      </div>

      <div className="flex items-center gap-1 p-1 rounded-lg border border-gray-200 bg-white">
        <button
          onClick={() => onProvider("github")}
          disabled={!githubConnected}
          title={!githubConnected ? "GitHub belum terhubung" : "GitHub"}
          className={cn(
            "flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium transition-all",
            provider === "github" && githubConnected
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:text-gray-700",
            !githubConnected && "opacity-40 cursor-not-allowed"
          )}
        >
          <GitHubIcon className="w-3.5 h-3.5" />
          GitHub
          {!githubConnected && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 ml-1">
              Connect
            </span>
          )}
        </button>

        <button
          onClick={() => onProvider("gitlab")}
          disabled={!gitlabConnected}
          title={!gitlabConnected ? "GitLab belum terhubung" : "GitLab"}
          className={cn(
            "flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium transition-all",
            provider === "gitlab" && gitlabConnected
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:text-gray-700",
            !gitlabConnected && "opacity-40 cursor-not-allowed"
          )}
        >
          <GitLabIcon className="w-3.5 h-3.5 text-[#fc6d26]" />
          GitLab
          {!gitlabConnected && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 ml-1">
              Connect
            </span>
          )}
        </button>
      </div>

      <ShowPerPage value={pageSize} onChange={onPageSize} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center justify-between w-28 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 outline-none hover:border-gray-300 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
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
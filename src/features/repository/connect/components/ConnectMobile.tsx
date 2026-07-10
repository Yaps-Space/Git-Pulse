"use client"

import { Search, SlidersHorizontal, AlertCircle, X, RefreshCw } from "lucide-react"
import { Input }  from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { MobilePageHeader } from "@/shared/components/commons/MobilePageHeader"
import { ShowPerPage }  from "@/shared/components/commons/ShowPerPage"
import { Pagination }   from "@/shared/components/commons/Pagination"
import { ConnectRepoList } from "./ConnectRepoList"
import { GitHubIcon, GitLabIcon } from "@/shared/components/commons/ProviderIcons"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { FILTER_OPTIONS } from "../constants/ConnectFilter"
import { cn } from "@/shared/lib/utils"
import { GithubRepo, Provider } from "@/features/repository/types"

type FetchState = "idle" | "loading" | "no_token" | "expired" | "empty" | "ok"

interface Props {
  search:          string
  filter:          string
  pageSize:        number
  page:            number
  totalPages:      number
  paginated:       GithubRepo[]
  connecting:      string | null
  fetchState:      FetchState
  error:           string
  githubConnected: boolean
  gitlabConnected: boolean
  onSearch:        (val: string) => void
  onFilter:        (val: string) => void
  onPageSize:      (val: number) => void
  onPageChange:    (val: number) => void
  onConnect:       (repo: GithubRepo) => void
  onDismissError:  () => void
  provider:        Provider
  onProvider:      (p: Provider) => void
}

export function ConnectMobile({
  search, filter, pageSize, page, totalPages, paginated,
  connecting, fetchState, error,
  githubConnected, gitlabConnected,
  onSearch, onFilter, onPageSize, onPageChange, onConnect, onDismissError,
  provider, onProvider,
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

          <div className="flex items-center gap-1 p-1 rounded-lg border border-white/10 bg-white/10">
            <button
              onClick={() => onProvider("github")}
              disabled={!githubConnected}
              className={cn(
                "flex items-center gap-1.5 h-8 px-2.5 rounded-md text-sm font-medium transition-all",
                provider === "github" && githubConnected
                  ? "bg-white text-gray-900"
                  : "text-white/70 hover:text-white",
                !githubConnected && "opacity-40 cursor-not-allowed"
              )}
            >
              <GitHubIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onProvider("gitlab")}
              disabled={!gitlabConnected}
              className={cn(
                "flex items-center gap-1.5 h-8 px-2.5 rounded-md text-sm font-medium transition-all",
                provider === "gitlab" && gitlabConnected
                  ? "bg-white text-gray-900"
                  : "text-white/70 hover:text-white",
                !gitlabConnected && "opacity-40 cursor-not-allowed"
              )}
            >
              <GitLabIcon className="w-3.5 h-3.5 text-[#fc6d26]" />
            </button>
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
            <DropdownMenuContent align="end" className="min-w-[140px]">
              {FILTER_OPTIONS.map(o => (
                <DropdownMenuItem
                  key={o.value}
                  onClick={() => onFilter(o.value)}
                  className={cn("text-sm cursor-pointer", o.value === filter && "font-semibold bg-gray-50")}
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

        {fetchState === "expired" && (
          <div className="bg-white rounded-xl px-4 py-4 flex items-center justify-between border border-amber-100">
            <div>
              <p className="font-medium text-gray-800 text-sm">
                Sesi {provider === "github" ? "GitHub" : "GitLab"} sudah habis
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Hubungkan ulang untuk melanjutkan</p>
            </div>
            <a href={`/api/auth/connect/${provider}/init`}>
              <Button size="sm" variant="outline" className="gap-2 text-xs">
                <RefreshCw className="w-3.5 h-3.5" />
                Ulang
              </Button>
            </a>
          </div>
        )}

        {fetchState === "empty" && (
          <div className="bg-white rounded-xl flex flex-col items-center justify-center py-12 gap-2">
            <p className="font-medium text-gray-700 text-sm">
              Tidak ada repository di {provider === "github" ? "GitHub" : "GitLab"}
            </p>
            <p className="text-xs text-gray-400">Coba ganti filter atau provider</p>
          </div>
        )}

        {fetchState === "ok" && (
          <ConnectRepoList
            variant="mobile"
            paginated={paginated}
            page={page}
            totalPages={totalPages}
            connecting={connecting}
            provider={provider}
            onConnect={onConnect}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  )
}
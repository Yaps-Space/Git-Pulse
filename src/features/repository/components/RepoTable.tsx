"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Github } from "lucide-react"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/shared/components/ui/table"
import { Pagination }    from "@/shared/components/commons/Pagination"
import { RepoSortIcon }  from "./RepoSortIcon"
import { Repo, SortKey, SortDir } from "../types"
import { PRODUCTIVITY_COLOR, PRODUCTIVITY_BG, GRADE_COLOR } from "../constants"
import { sortRepos }       from "../helpers"
import { SORTABLE_COLUMNS } from "../constants/Sortable"
import { capitalizeFirst }  from "@/shared/helpers"

function GitLabIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51 1.22 3.78a.84.84 0 0 1-.3.92z"/>
    </svg>
  )
}

interface Props {
  repos:    Repo[]
  search:   string
  pageSize: number
}

export function RepoTable({ repos, search, pageSize }: Props) {
  const router                = useRouter()
  const [page,    setPage]    = useState(1)
  const [sortKey, setSortKey] = useState<SortKey>("analyzedAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("desc") }
    setPage(1)
  }

  const filtered   = repos.filter(r => r.fullName.toLowerCase().includes(search.toLowerCase()))
  const sorted     = sortRepos(filtered, sortKey, sortDir)
  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize)

  const isSortable = (label: string) => SORTABLE_COLUMNS.some(c => c.label === label)
  const getSortKey = (label: string) => SORTABLE_COLUMNS.find(c => c.label === label)?.key

  if (paginated.length === 0) {
    return (
      <div className="bg-white rounded-xl flex flex-col items-center justify-center py-16 gap-3">
        <p className="font-medium text-gray-700">Belum ada repository</p>
        <p className="text-sm text-gray-400">Klik Connect untuk mulai menganalisis</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-900 hover:bg-gray-900">
            {["No", "Repository", "Productivity", "Health Score", "Grade", "Terakhir Dianalisis"].map(h => {
              const key = getSortKey(h)
              return (
                <TableHead
                  key={h}
                  className="text-white font-semibold text-xs"
                  onClick={() => key && handleSort(key)}
                  style={{ cursor: isSortable(h) ? "pointer" : "default" }}
                >
                  <div className="flex items-center gap-1.5 select-none">
                    {h}
                    {key && <RepoSortIcon col={key} sortKey={sortKey} sortDir={sortDir} />}
                  </div>
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((repo, idx) => (
            <TableRow
              key={repo.id}
              className="border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => router.push(`/repository/${repo.id}`)}
            >
              <TableCell className="text-sm text-gray-400">
                {(page - 1) * pageSize + idx + 1}.
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  {repo.provider === "gitlab"
                    ? <GitLabIcon className="w-3.5 h-3.5 text-[#fc6d26] flex-shrink-0" />
                    : <Github     className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  }
                  <p className="font-medium text-sm text-gray-800">{repo.fullName}</p>
                </div>
              </TableCell>

              <TableCell>
                <span
                  className="px-3 py-1 rounded-sm text-xs font-medium inline-flex items-center justify-center w-18"
                  style={{
                    background: PRODUCTIVITY_BG[capitalizeFirst(repo.productivityState)]    ?? "#88888818",
                    color:      PRODUCTIVITY_COLOR[capitalizeFirst(repo.productivityState)]  ?? "#888",
                  }}
                >
                  {capitalizeFirst(repo.productivityState) || "-"}
                </span>
              </TableCell>

              <TableCell>
                <span className="text-sm font-medium text-gray-700">
                  {repo.healthScore ? `${repo.healthScore}/100` : "-"}
                </span>
              </TableCell>

              <TableCell>
                <span
                  className="w-8 h-8 inline-flex items-center justify-center text-lg font-bold"
                  style={{ color: GRADE_COLOR[repo.healthGrade] ?? "#888" }}
                >
                  {repo.healthGrade || "-"}
                </span>
              </TableCell>

              <TableCell className="text-sm text-gray-400">
                {repo.analyzedAt ? new Date(repo.analyzedAt).toLocaleDateString("id-ID") : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="p-4 border-t border-gray-100">
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  )
}
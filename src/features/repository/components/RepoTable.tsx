"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { Pagination } from "@/shared/components/commons/Pagination"
import { RepoSortIcon } from "./RepoSortIcon"
import { Repo, SortKey, SortDir } from "../types"
import { PRODUCTIVITY_COLOR, PRODUCTIVITY_BG, GRADE_COLOR } from "../constants"
import { sortRepos } from "../helpers"
import { SORTABLE_COLUMNS } from "../constants/Sortable"

interface Props {
  repos:    Repo[]
  search:   string
  pageSize: number
}

export function RepoTable({ repos, search, pageSize }: Props) {
  const router           = useRouter()
  const [page, setPage]  = useState(1)
  const [sortKey, setSortKey] = useState<SortKey>("analyzedAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
    setPage(1)
  }

  const filtered   = repos.filter(r =>
    r.fullName.toLowerCase().includes(search.toLowerCase())
  )
  const sorted     = sortRepos(filtered, sortKey, sortDir)
  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize)

  const isSortable = (label: string) =>
    SORTABLE_COLUMNS.some(c => c.label === label)

  const getSortKey = (label: string) =>
    SORTABLE_COLUMNS.find(c => c.label === label)?.key

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="font-medium text-gray-700">Belum ada repository</p>
          <p className="text-sm text-gray-400">Klik Connect untuk mulai menganalisis</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-900 hover:bg-gray-900">
                {["No", "Repository", "Productivity", "Health Score", "Grade", "Last Analyzed", "Detail"].map(h => {
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
                        {key && (
                          <RepoSortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((repo, idx) => (
                <TableRow key={repo.id} className="border-gray-100">
                  <TableCell className="text-sm text-gray-400">
                    {(page - 1) * pageSize + idx + 1}.
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-sm text-gray-800">{repo.fullName}</p>
                  </TableCell>
                  <TableCell>
                    <span
                      className="px-3 py-1 rounded-sm text-xs font-medium inline-flex items-center justify-center w-18"
                      style={{
                        background: PRODUCTIVITY_BG[repo.productivityState]   ?? "#88888818",
                        color:      PRODUCTIVITY_COLOR[repo.productivityState] ?? "#888",
                      }}
                    >
                      {repo.productivityState || "-"}
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
                  <TableCell>
                    <button
                      onClick={() => router.push(`/repository/${repo.id}`)}
                      className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Lihat Detail
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="p-4 border-t border-gray-100">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </>
      )}
    </div>
  )
}
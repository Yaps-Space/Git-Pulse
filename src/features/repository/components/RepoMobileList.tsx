"use client"

import { useState } from "react"
import { ShowPerPage } from "@/shared/components/commons/ShowPerPage"
import { Pagination }  from "@/shared/components/commons/Pagination"
import { RepoMobileCard } from "./RepoMobileCard"
import { Repo, SortKey, SortDir } from "../types"
import { sortRepos } from "../helpers"

interface Props {
  repos:      Repo[]
  search:     string
  sortKey:    SortKey
  sortDir:    SortDir
  pageSize:   number
  onPageSize: (val: number) => void
}

export function RepoMobileList({ repos, search, sortKey, sortDir, pageSize, onPageSize }: Props) {
  const [page, setPage] = useState(1)

  const filtered   = repos.filter(r =>
    r.fullName.toLowerCase().includes(search.toLowerCase())
  )
  const sorted     = sortRepos(filtered, sortKey, sortDir)
  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize)

  const handlePageSize = (val: number) => { onPageSize(val); setPage(1) }

  return (
    <div className="px-4 pt-5 pb-6 flex flex-col gap-3">
      <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
        <ShowPerPage
          variant="mobile"
          value={pageSize}
          onChange={handlePageSize}
        />
        <Pagination
          variant="mobile"
          page={page}
          totalPages={totalPages}
          onChange={setPage}
        />
      </div>

      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="font-medium text-gray-700">Belum ada repository</p>
          <p className="text-sm text-gray-400">Klik + untuk mulai menganalisis</p>
        </div>
      ) : (
        paginated.map((repo, idx) => (
          <RepoMobileCard
            key={repo.id}
            repo={repo}
            index={(page - 1) * pageSize + idx + 1}
          />
        ))
      )}
    </div>
  )
}
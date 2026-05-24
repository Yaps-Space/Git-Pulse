"use client"

import { Pagination } from "@/shared/components/commons/Pagination"
import { ConnectRepoItem } from "./ConnectRepoItem"
import { GithubRepo } from "../types"

interface Props {
  paginated:   GithubRepo[]
  page:        number
  totalPages:  number
  connecting:  string | null
  onConnect:   (repo: GithubRepo) => void
  onPageChange: (page: number) => void
}

export function ConnectRepoList({ paginated, page, totalPages, connecting, onConnect, onPageChange }: Props) {
  if (paginated.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <p className="font-medium text-gray-700">Tidak ada repository ditemukan</p>
      </div>
    )
  }

  return (
    <>
      {paginated.map(repo => (
        <ConnectRepoItem
          key={repo.id}
          repo={repo}
          connecting={connecting}
          onConnect={onConnect}
        />
      ))}
      <div className="p-4 border-t border-gray-100">
        <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
      </div>
    </>
  )
}
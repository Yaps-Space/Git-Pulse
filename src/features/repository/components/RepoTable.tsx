"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { ShowPerPage } from "@/shared/components/commons/ShowPerPage"
import { Pagination }  from "@/shared/components/commons/Pagination"
import { Repo } from "../types"
import { PRODUCTIVITY_COLOR, PRODUCTIVITY_BG, GRADE_COLOR } from "../constants"

interface Props {
  repos: Repo[]
}

export function RepoTable({ repos }: Props) {
  const router                    = useRouter()
  const [search,   setSearch]     = useState("")
  const [pageSize, setPageSize]   = useState(10)
  const [page,     setPage]       = useState(1)

  const filtered   = repos.filter(r =>
    r.fullName.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const handlePageSize = (val: number) => {
    setPageSize(val)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search"
            className="pl-9 h-10 bg-white border-gray-200 text-sm"
          />
        </div>

        <ShowPerPage value={pageSize} onChange={handlePageSize} />

        <Button asChild className="h-10 gap-2 bg-[#00D964] hover:bg-[#00c057] text-gray-900 font-semibold">
          <Link href="/repository/connect">
            <Plus className="w-4 h-4" />
            Connect
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden">
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
                  {["No", "Repository", "Productivity", "Health Score", "Grade", "Last Analyzed", "Detail"].map(h => (
                    <TableHead key={h} className="text-white font-semibold text-xs">
                      {h}
                    </TableHead>
                  ))}
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
                        className="px-3 py-1 rounded-full text-xs font-semibold"
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
                        className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: GRADE_COLOR[repo.healthGrade] ?? "#888" }}
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
    </div>
  )
}
"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input }       from "@/shared/components/ui/input"
import { ShowPerPage } from "@/shared/components/commons/ShowPerPage"
import { Pagination }  from "@/shared/components/commons/Pagination"
import { TeamSpaceMemberCard } from "./TeamSpaceMemberCard"
import { TeamMember }          from "../../types/TeamSpace"
import { TeamSpaceDetail }     from "../types/TeamSpaceDetail"

interface Props {
  members:             TeamMember[]
  myRole:              string
  classId:             string
  onMutate:            (fn: (data: TeamSpaceDetail) => TeamSpaceDetail) => void
  showSearchAndFilter: boolean
}

export function TeamSpaceMemberList({ members, myRole, classId, onMutate, showSearchAndFilter }: Props) {
  const [search,   setSearch]   = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [page,     setPage]     = useState(1)

  const filtered   = members.filter(m => m.userName.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSearch   = (val: string) => { setSearch(val);   setPage(1) }
  const handlePageSize = (val: number) => { setPageSize(val); setPage(1) }

  const handleAnalyze = (memberId: string) => {
    onMutate(data => ({
      ...data,
      members: data.members.map(m => m.id === memberId ? { ...m, status: "analyzing" } : m),
    }))
  }

  const handleKick = (memberId: string) => {
    onMutate(data => ({
      ...data,
      members: data.members.filter(m => m.id !== memberId),
    }))
  }

  const handleRoleChange = (memberId: string, role: string) => {
    onMutate(data => ({
      ...data,
      members: data.members.map(m => m.id === memberId ? { ...m, role } : m),
    }))
  }

  return (
    <div className="flex flex-col gap-3">
      {showSearchAndFilter && (
        <>
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
            <ShowPerPage variant="mobile" value={pageSize} onChange={handlePageSize} />
            <Pagination variant="mobile" page={page} totalPages={totalPages} onChange={setPage} />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search anggota..."
              className="pl-9 h-10 bg-white border-gray-200 text-sm"
            />
          </div>
        </>
      )}

      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="font-medium text-gray-700">Tidak ada anggota ditemukan</p>
        </div>
      ) : (
        paginated.map(member => (
          <TeamSpaceMemberCard
            key={member.id}
            member={member}
            myRole={myRole}
            classId={classId}
            onAnalyze={() => handleAnalyze(member.id)}
            onKick={() => handleKick(member.id)}
            onRoleChange={role => handleRoleChange(member.id, role)}
          />
        ))
      )}
    </div>
  )
}
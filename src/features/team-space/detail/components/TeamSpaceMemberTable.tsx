"use client"

import Image from "next/image"
import { useState } from "react"
import { Search } from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/components/ui/table"
import { Input }       from "@/shared/components/ui/input"
import { ShowPerPage } from "@/shared/components/commons/ShowPerPage"
import { Pagination }  from "@/shared/components/commons/Pagination"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL }         from "../../constants/TeamSpaceConfig"
import { CONSISTENCY_LABEL, STATUS_COLOR, STATUS_LABEL } from "../constants/TeamSpaceDetail"
import { SORTABLE_MEMBER_COLUMNS }                   from "../constants/SortableMember"
import { MemberSortIcon }                            from "./MemberSortIcon"
import MemberActions                                 from "./MemberActions"
import { sortMembers }                               from "../helpers/sortMembers"
import { TeamMember }                                from "../../types/TeamSpace"
import { TeamSpaceDetail }                           from "../types/TeamSpaceDetail"
import { SortKey, SortDir }                          from "../types/TeamSpaceMember"
import { capitalizeFirst }                           from "@/shared/helpers"

interface Props {
  members:             TeamMember[]
  myRole:              string
  ownerId:             string
  classId:             string
  onMutate:            (optimisticFn: (data: TeamSpaceDetail) => TeamSpaceDetail) => void
  showSearchAndFilter: boolean
}

const COLUMNS = ["No", "Anggota", "Role", "Frekuensi Commits", "Kontribusi", "Konsistensi", "Active Weeks", "Status", "Actions"]

export function TeamSpaceMemberTable({ members, myRole, classId, onMutate, showSearchAndFilter }: Props) {
  const [search,   setSearch]   = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [page,     setPage]     = useState(1)
  const [sortKey,  setSortKey]  = useState<SortKey>("displayName")
  const [sortDir,  setSortDir]  = useState<SortDir>("asc")

  const handleSearch   = (val: string) => { setSearch(val);   setPage(1) }
  const handlePageSize = (val: number) => { setPageSize(val); setPage(1) }

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
    setPage(1)
  }

  const handleAnalyze = (memberId: string) => {
    onMutate((data: TeamSpaceDetail) => ({
      ...data,
      members: data.members.map((m: TeamMember) =>
        m.id === memberId ? { ...m, status: "analyzing" } : m
      ),
    }))
  }

  const handleKick = (memberId: string) => {
    onMutate((data: TeamSpaceDetail) => ({
      ...data,
      members: data.members.filter((m: TeamMember) => m.id !== memberId),
    }))
  }

  const handleRoleChange = (memberId: string, role: string) => {
    onMutate((data: TeamSpaceDetail) => ({
      ...data,
      members: data.members.map((m: TeamMember) =>
        m.id === memberId ? { ...m, role } : m
      ),
    }))
  }

  const filtered = members.filter(m => {
    const displayName = (m.displayName ?? m.userName).toLowerCase()
    const login       = (m.userLogin ?? "").toLowerCase()
    const q           = search.toLowerCase()
    return displayName.includes(q) || login.includes(q)
  })

  const sorted     = sortMembers(filtered, sortKey, sortDir)
  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize)

  const getSortKey = (label: string) =>
    SORTABLE_MEMBER_COLUMNS.find(c => c.label === label)?.key

  return (
    <div className="space-y-4">
      {showSearchAndFilter && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search"
              className="pl-9 h-10 bg-white border-gray-200 text-sm"
            />
          </div>
          <ShowPerPage value={pageSize} onChange={handlePageSize} />
        </div>
      )}

      <div className="bg-white rounded-xl overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="font-medium text-gray-700">Belum ada anggota</p>
            <p className="text-sm text-gray-400">Tambahkan anggota untuk memulai</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-900 hover:bg-gray-900">
                  {COLUMNS.map(h => {
                    const key = getSortKey(h)
                    return (
                      <TableHead
                        key={h}
                        className="text-white font-semibold text-xs tracking-wider"
                        onClick={() => key && handleSort(key)}
                        style={{ cursor: key ? "pointer" : "default" }}
                      >
                        <div className="flex items-center gap-1.5 select-none">
                          {h}
                          {key && <MemberSortIcon col={key} sortKey={sortKey} sortDir={sortDir} />}
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((member, idx) => {
                  const displayName = member.displayName ?? member.userName
                  return (
                    <TableRow key={member.id} className="border-gray-100">
                      <TableCell className="text-sm text-gray-400">
                        {(page - 1) * pageSize + idx + 1}.
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {member.userImage ? (
                            <Image
                              src={member.userImage}
                              alt={displayName}
                              width={32}
                              height={32}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-gray-500">
                                {displayName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{displayName}</p>
                            {member.userLogin && (
                              <p className="text-xs text-gray-400">@{member.userLogin}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: ROLE_COLOR[member.role] ?? "#eee", color: ROLE_TEXT[member.role] ?? "#333" }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_TEXT[member.role] ?? "#333" }} />
                          {ROLE_LABEL[member.role] ?? member.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {member.commitVelocity.toFixed(1)} / hari
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {(member.contributionShare * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {CONSISTENCY_LABEL(member.activityConsistency)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {Math.round(member.activeWeeksRatio * 100)}%
                      </TableCell>
                      <TableCell>
                        <span
                          className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-sm text-xs font-medium"
                          style={{ background: STATUS_COLOR[capitalizeFirst(member.status)] ?? "#888" }}
                        >
                          {member.status === "analyzing" && (
                            <span className="w-2 h-2 rounded-full border border-current border-t-transparent animate-spin" />
                          )}
                          {STATUS_LABEL[capitalizeFirst(member.status)] ?? capitalizeFirst(member.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <MemberActions
                          memberId={member.id}
                          memberName={displayName}
                          memberStatus={member.status}
                          currentRole={member.role}
                          myRole={myRole}
                          classId={classId}
                          onAnalyze={() => handleAnalyze(member.id)}
                          onKick={() => handleKick(member.id)}
                          onRoleChange={role => handleRoleChange(member.id, role)}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {showSearchAndFilter && totalPages > 1 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
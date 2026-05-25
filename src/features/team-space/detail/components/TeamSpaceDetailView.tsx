"use client"

import Image from "next/image"
import { Users, GitBranch } from "lucide-react"
import { useState } from "react"
import { useTeamSpaceDetail } from "../hooks/useTeamSpaceDetail"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL } from "../../constants/TeamSpaceConfig"
import { STATUS_COLOR, STATUS_LABEL, CONSISTENCY_LABEL } from "../constants/TeamSpaceDetail"
import { CopyButton }          from "./CopyButton"
import { QRButton }            from "./QRButton"
import MemberManagement        from "./MemberManagement"
import MemberActions           from "./MemberActions"
import TeamSpaceFooterActions  from "./TeamSpaceFooterActions"
import { Input }               from "@/shared/components/ui/input"
import { ShowPerPage }         from "@/shared/components/commons/ShowPerPage"
import { Pagination }          from "@/shared/components/commons/Pagination"
import { Search }              from "lucide-react"

interface Props {
  id: string
}

export default function TeamSpaceDetailView({ id }: Props) {
  const { detail }            = useTeamSpaceDetail(id)
  const [search,   setSearch] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [page,     setPage]   = useState(1)

  if (!detail) return null

  const isEvaluator   = detail.myRole === "owner" || detail.myRole === "evaluator"
  const activeCount   = detail.members.filter(m => m.status === "Active").length
  const passiveCount  = detail.members.filter(m => m.status === "Passive").length
  const inactiveCount = detail.members.filter(m => m.status === "Inactive").length

  const STATUS_STATS = [
    { label: "Active",   count: activeCount,   color: STATUS_COLOR.Active,   description: "Total account aktif"       },
    { label: "Passive",  count: passiveCount,  color: STATUS_COLOR.Passive,  description: "Total account pasif"       },
    { label: "Inactive", count: inactiveCount, color: STATUS_COLOR.Inactive, description: "Total account tidak aktif" },
  ]

  const CONTRIBUTION_ITEMS = [
    { label: "Commit Velocity",    value: `${detail.myMembership.commitVelocity.toFixed(1)}/hari`        },
    { label: "Contribution Share", value: `${(detail.myMembership.contributionShare * 100).toFixed(1)}%` },
    { label: "Consistency",        value: CONSISTENCY_LABEL(detail.myMembership.activityConsistency)     },
    { label: "Active Weeks",       value: `${Math.round(detail.myMembership.activeWeeksRatio * 100)}%`   },
  ]

  const filteredMembers = detail.members.filter(m =>
    m.userName.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages  = Math.ceil(filteredMembers.length / pageSize)
  const paginated   = filteredMembers.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: ROLE_COLOR[detail.myRole] ?? "#eee", color: ROLE_TEXT[detail.myRole] ?? "#333" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_TEXT[detail.myRole] ?? "#333" }} />
              {ROLE_LABEL[detail.myRole] ?? detail.myRole}
            </span>
          </div>
          {detail.description && (
            <p className="text-sm text-gray-400 mb-2">{detail.description}</p>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm text-gray-400">{detail.members.length} Anggota</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm text-gray-400">{detail.repoFullName}</span>
            </div>
          </div>
        </div>

        {isEvaluator && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200">
              <span className="text-xs text-gray-400">Kode:</span>
              <span className="font-mono font-bold tracking-widest text-gray-900">{detail.inviteCode}</span>
              <CopyButton text={detail.inviteCode} />
            </div>
            <QRButton inviteCode={detail.inviteCode} teamName={detail.name} />
          </div>
        )}
      </div>

      {isEvaluator ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            {STATUS_STATS.map(({ label, count, color, description }) => (
              <div key={label} className="bg-gray-900 rounded-2xl p-5">
                <p className="text-sm text-gray-400 mb-3">{label}</p>
                <p className="text-3xl font-bold mb-1" style={{ color }}>{count}</p>
                <p className="text-xs text-gray-500">Account</p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    placeholder="Search"
                    className="pl-9 h-10 bg-gray-50 border-gray-200 text-sm"
                  />
                </div>
                <ShowPerPage value={pageSize} onChange={val => { setPageSize(val); setPage(1) }} />
              </div>
              <MemberManagement classId={detail.id} />
            </div>

            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  {["No", "Anggota", "Role", "Frekuensi Commits", "Kontribusi", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-white uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((member, idx) => (
                  <tr key={member.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-400">{(page - 1) * pageSize + idx + 1}.</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {member.userImage && (
                          <Image
                            src={member.userImage}
                            alt={member.userName}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                        )}
                        <p className="text-sm font-medium text-gray-900">{member.userName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: ROLE_COLOR[member.role] ?? "#eee", color: ROLE_TEXT[member.role] ?? "#333" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_TEXT[member.role] ?? "#333" }} />
                        {ROLE_LABEL[member.role] ?? member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{member.commitVelocity.toFixed(1)} / hari</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{(member.contributionShare * 100).toFixed(1)}%</td>
                    <td className="px-6 py-4">
                      <span
                        className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: (STATUS_COLOR[member.status] ?? "#888") + "18",
                          color:      STATUS_COLOR[member.status] ?? "#888",
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[member.status] ?? "#888" }} />
                        {STATUS_LABEL[member.status] ?? member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <MemberActions
                        memberId={member.id}
                        memberRole={member.role}
                        memberUserId={member.userId}
                        myRole={detail.myRole}
                        ownerId={detail.ownerId}
                        classId={detail.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="max-w-lg">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-lg text-gray-900 mb-4">My Contribution</h2>

            {detail.myMembership.status === "pending" ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <span className="text-4xl">⏳</span>
                <p className="font-medium text-gray-700">Belum Dianalisis</p>
                <p className="text-sm text-center text-gray-400">
                  Data kontribusimu sedang menunggu analisis dari evaluator
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <span
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
                    style={{
                      background: (STATUS_COLOR[detail.myMembership.status] ?? "#888") + "18",
                      color:      STATUS_COLOR[detail.myMembership.status] ?? "#888",
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[detail.myMembership.status] ?? "#888" }} />
                    {STATUS_LABEL[detail.myMembership.status] ?? detail.myMembership.status}
                  </span>
                </div>

                <div className="flex flex-col gap-0">
                  {CONTRIBUTION_ITEMS.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-400">{label}</span>
                      <span className="text-sm font-semibold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>

                {detail.myMembership.recommendation && (
                  <div className="mt-4 p-3 rounded-xl bg-[#BEF3DF] flex items-start gap-2">
                    <span className="text-[#00D964] mt-0.5">💡</span>
                    <p className="text-sm text-gray-700">{detail.myMembership.recommendation}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <TeamSpaceFooterActions classId={detail.id} myRole={detail.myRole} />
    </div>
  )
}
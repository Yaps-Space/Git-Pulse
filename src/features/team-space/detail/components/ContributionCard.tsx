"use client"

import Image from "next/image"
import { useState } from "react"
import { BarChart2 } from "lucide-react"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL }                      from "../../constants/TeamSpaceConfig"
import { STATUS_COLOR, STATUS_LABEL, getContributionItems }       from "../constants/TeamSpaceDetail"
import { resolveMemberName }                                      from "../helpers/resolveMemberName"
import { TeamMember }                                             from "../../types/TeamSpace"
import { TeamSpaceDetail }                                        from "../types/TeamSpaceDetail"
import { capitalizeFirst }                                        from "@/shared/helpers"

interface Props {
  member:   TeamMember
  classId:  string
  onMutate: (fn: (data: TeamSpaceDetail) => TeamSpaceDetail) => void
}

export function ContributionCard({ member, classId, onMutate }: Props) {
  const [loading, setLoading] = useState(false)
  const items = getContributionItems(member)
  const displayName = resolveMemberName(member)

  const handleAnalyze = async () => {
    onMutate(data => ({
      ...data,
      myMembership: { ...data.myMembership, status: "analyzing" },
    }))
    setLoading(true)
    try {
      await fetch(`/api/team-space/${classId}/member/${member.id}/analyze`, { method: "POST" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900">My Contribution</p>
        <button
          onClick={handleAnalyze}
          disabled={loading || member.status === "analyzing"}
          className="w-20 h-6 flex items-center justify-center rounded-md bg-[#00D964] hover:bg-[#00b853] text-gray-900 transition-colors disabled:opacity-50 gap-1"
        >
          <BarChart2 className="w-3 h-3" />
          <p className="text-xs">Analyze</p>
        </button>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {member.userImage && (
              <Image
                src={member.userImage}
                alt={displayName}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">{displayName}</p>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-0.5"
                style={{ background: ROLE_COLOR[member.role] ?? "#eee", color: ROLE_TEXT[member.role] ?? "#333" }}
              >
                <span className="w-1 h-1 rounded-full" style={{ background: ROLE_TEXT[member.role] ?? "#333" }} />
                {ROLE_LABEL[member.role] ?? member.role}
              </span>
            </div>
          </div>

          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ background: STATUS_COLOR[capitalizeFirst(member.status)] ?? "#eee" }}
          >
            {member.status === "analyzing" && (
              <span className="w-2 h-2 rounded-full border border-current border-t-transparent animate-spin" />
            )}
            {STATUS_LABEL[capitalizeFirst(member.status)] ?? capitalizeFirst(member.status)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg bg-gray-50">
              <span className="text-xs text-gray-400 tracking-wide">{item.label}</span>
              <span className="text-sm font-bold text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
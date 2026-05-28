"use client"

import { TeamMember } from "../../types/TeamSpace"
import { STATUS_COLOR, STATUS_LABEL, getContributionItems } from "../constants/TeamSpaceDetail"

interface Props {
  membership: TeamMember
}

export function TeamSpaceContribution({ membership }: Props) {
  const items = getContributionItems(membership)

  if (membership.status === "pending") {
    return (
      <div className="max-w-lg">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-4">My Contribution</h2>
          <div className="flex flex-col items-center py-8 gap-3">
            <span className="text-4xl">⏳</span>
            <p className="font-medium text-gray-700">Belum Dianalisis</p>
            <p className="text-sm text-center text-gray-400">
              Data kontribusimu sedang menunggu analisis dari evaluator
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (membership.status === "analyzing") {
    return (
      <div className="max-w-lg">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-4">My Contribution</h2>
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-[#6265FE] animate-spin" />
            <p className="font-medium text-gray-700">Sedang Dianalisis</p>
            <p className="text-sm text-center text-gray-400">
              Harap tunggu, data kontribusimu sedang diproses
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-lg text-gray-900 mb-4">My Contribution</h2>

        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-medium text-gray-500">Status</span>
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
            style={{
              background: (STATUS_COLOR[membership.status] ?? "#888") + "18",
              color:      STATUS_COLOR[membership.status] ?? "#888",
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[membership.status] ?? "#888" }} />
            {STATUS_LABEL[membership.status] ?? membership.status}
          </span>
        </div>

        <div className="flex flex-col">
          {items.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-400">{label}</span>
              <span className="text-sm font-semibold text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        {membership.recommendation && (
          <div className="mt-4 p-3 rounded-xl bg-[#BEF3DF] flex items-start gap-2">
            <span className="text-[#00D964] mt-0.5">💡</span>
            <p className="text-sm text-gray-700">{membership.recommendation}</p>
          </div>
        )}
      </div>
    </div>
  )
}
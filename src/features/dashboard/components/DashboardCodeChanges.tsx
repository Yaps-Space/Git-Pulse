"use client"

import { useMemo, useState } from "react"
import { DashboardRepo } from "../types"

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

type Range = "1" | "3" | "6" | "12"

interface Props {
  repos: DashboardRepo[]
}

function getLastNMonths(n: number): { label: string; monthIndex: number }[] {
  const now    = new Date()
  const result = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({ label: MONTH_NAMES[d.getMonth()], monthIndex: d.getMonth() })
  }
  return result
}

export function DashboardCodeChanges({ repos }: Props) {
  const [range, setRange] = useState<Range>("6")

  const { additions, deletions } = useMemo(() => {
    if (repos.length === 0) return { additions: 50, deletions: 50 }

    const months = getLastNMonths(parseInt(range))

    let totalCommits   = 0
    let weightedAdd    = 0
    let weightedDel    = 0

    months.forEach(({ monthIndex }) => {
      repos.forEach(r => {
        const c = r.commitsPerMonth?.[monthIndex] ?? 0
        totalCommits += c
        weightedAdd  += (r.additionsPercent ?? 50) * c
        weightedDel  += (r.deletionsPercent ?? 50) * c
      })
    })

    if (totalCommits === 0) return { additions: 50, deletions: 50 }

    return {
      additions: Math.round(weightedAdd / totalCommits),
      deletions: Math.round(weightedDel / totalCommits),
    }
  }, [repos, range])

  const isEmpty = repos.length === 0

  const gradient = `conic-gradient(
    #00D964 0deg ${additions * 3.6}deg,
    #BEF3DF ${additions * 3.6}deg 360deg
  )`

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h3 className="font-bold text-gray-900">Code Changes Breakdown</h3>
          <p className="text-xs text-gray-400 mt-0.5">Proportion of code additions and deletions</p>
        </div>
        <select
          value={range}
          onChange={e => setRange(e.target.value as Range)}
          className="text-xs px-2 py-1 outline-none text-gray-600 bg-white"
        >
          <option value="1">Last Month</option>
          <option value="3">3 Months</option>
          <option value="6">6 Months</option>
          <option value="12">Last Year</option>
        </select>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center flex-1 py-10 gap-2">
          <p className="text-sm text-gray-400">Belum ada data</p>
          <p className="text-xs text-gray-300">Connect repository untuk melihat data</p>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-8 mt-2">
          <div className="w-36 h-36 rounded-full flex-shrink-0" style={{ background: gradient }} />
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-sm bg-[#00D964] flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Additions</p>
                <p className="text-xs text-gray-400">{additions}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-sm bg-[#BEF3DF] flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Deletions</p>
                <p className="text-xs text-gray-400">{deletions}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
"use client"

import { GRADE_COLOR } from "@/features/repository/constants"

interface Props {
  avgHealthScore: number
  avgHealthGrade: string
  academicYear:   string | null
  studyProgram:   string | null
  projectManager: string | null
}

export function TeamSpaceRepoStats({
  avgHealthScore,
  avgHealthGrade,
  academicYear,
  studyProgram,
  projectManager,
}: Props) {
  const gradeColor = GRADE_COLOR[avgHealthGrade] ?? "#9ca3af"
  const hasHealth  = avgHealthScore > 0

  return (
    <div className="flex flex-col gap-2">
      {hasHealth && (
        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50">
          <span className="text-xs text-gray-500">Health Score</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold tabular-nums" style={{ color: gradeColor }}>
              {avgHealthScore.toFixed(1)}
            </span>
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded"
              style={{ color: gradeColor, background: `${gradeColor}20` }}
            >
              {avgHealthGrade !== "-" ? avgHealthGrade : "—"}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 px-3 py-2.5 rounded-md bg-gray-50">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[11px] text-gray-400">Dosen PM</span>
          <span className="text-xs font-semibold text-gray-700 truncate">
            {projectManager ?? "-"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[11px] text-gray-400">Program Studi</span>
          <span className="text-xs font-semibold text-gray-700 truncate">
            {studyProgram ?? "-"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[11px] text-gray-400">Tahun Ajaran</span>
          <span className="text-xs font-semibold text-gray-700 truncate">
            {academicYear ?? "-"}
          </span>
        </div>
      </div>
    </div>
  )
}
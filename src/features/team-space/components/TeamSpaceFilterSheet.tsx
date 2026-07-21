"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { useIsMobile } from "@/shared/hooks/UseMobile"
import { ROLE_LABEL } from "../constants/TeamSpaceConfig"
import { TeamSpaceFilterState } from "./TeamSpaceListView"
import { cn } from "@/shared/lib/utils"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog"
import { InfiniteCombobox } from "@/shared/components/commons/InfiniteCombobox"

interface Props {
  open:          boolean
  filters:       TeamSpaceFilterState
  studyPrograms: string[]
  academicYears: string[]
  onClose:       () => void
  onFilter:      (f: TeamSpaceFilterState) => void
}

export function TeamSpaceFilterSheet({ open, filters, studyPrograms, academicYears, onClose, onFilter }: Props) {
  const isMobile = useIsMobile()
  const [draft, setDraft]       = useState<TeamSpaceFilterState>(filters)
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setDraft(filters)
  }

  const set = (key: keyof TeamSpaceFilterState, val: string) =>
    setDraft(prev => ({ ...prev, [key]: val }))

  const hasActive = draft.role || draft.studyProgram || draft.academicYear

  const handleReset = () => {
    const empty: TeamSpaceFilterState = { role: "", studyProgram: "", academicYear: "" }
    setDraft(empty)
    onFilter(empty)
    onClose()
  }

  const handleApply = () => {
    onFilter(draft)
    onClose()
  }

  const studyProgramOptions = studyPrograms.map(label => ({ id: label, label }))
  const academicYearOptions = academicYears.map(label => ({ id: label, label }))

  const body = (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</p>
        <div className="flex flex-wrap gap-2">
          {["", ...Object.keys(ROLE_LABEL)].map(r => (
            <button
              key={r}
              onClick={() => set("role", r)}
              className={cn(
                "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                draft.role === r
                  ? "border-[#00d964] bg-[#00d964]/10 text-gray-900"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
              )}
            >
              {r === "" ? "Semua" : ROLE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {studyPrograms.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Program Studi</p>
          <InfiniteCombobox
            options={studyProgramOptions}
            value={draft.studyProgram}
            onChange={v => set("studyProgram", v as string)}
            placeholder="Semua"
            searchPlaceholder="Cari program studi..."
            emptyMessage="Program studi tidak ditemukan"
          />
        </div>
      )}

      {academicYears.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tahun Ajaran</p>
          <InfiniteCombobox
            options={academicYearOptions}
            value={draft.academicYear}
            onChange={v => set("academicYear", v as string)}
            placeholder="Semua"
            searchPlaceholder="Cari tahun ajaran..."
            emptyMessage="Tahun ajaran tidak ditemukan"
          />
        </div>
      )}
    </>
  )

  const footer = (
    <div className="flex gap-3 mt-2">
      {hasActive && (
        <Button
          className="flex-1 h-10 rounded-lg text-gray-900 font-bold bg-[#CACACA] hover:bg-[#b0b0b0]"
          onClick={handleReset}
        >
          Reset
        </Button>
      )}
      <Button
        className="flex-1 h-10 rounded-lg bg-[#00D964] hover:bg-[#00c057] text-gray-900 font-bold"
        onClick={handleApply}
      >
        Terapkan
      </Button>
    </div>
  )

  if (isMobile) return open ? (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <p className="font-bold text-gray-900 text-base">Filter</p>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-5">{body}</div>
        <div className="px-5 pb-6 pt-2 border-t border-gray-100">{footer}</div>
      </div>
    </div>
  ) : null

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm rounded-2xl [&>button]:hidden">
        <DialogHeader>
          <div className="relative flex items-center justify-center">
            <DialogTitle className="text-lg font-bold text-gray-900">Filter</DialogTitle>
            <button
              onClick={onClose}
              className="absolute right-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-5 mt-2">{body}</div>
        {footer}
      </DialogContent>
    </Dialog>
  )
}
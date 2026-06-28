"use client"

import { X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { GitHubIcon, GitLabIcon } from "@/shared/components/commons/ProviderIcons"
import { useIsMobile } from "@/shared/hooks/UseMobile"
import { FilterState } from "./RepositoryLayout"
import { cn } from "@/shared/lib/utils"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog"

const PRODUCTIVITY_OPTIONS = ["active", "inactive", "new"]
const GRADE_OPTIONS        = ["A", "B", "C", "D", "F"]

interface Props {
  open:     boolean
  filters:  FilterState
  onClose:  () => void
  onFilter: (f: FilterState) => void
}

export function FilterSheet({ open, filters, onClose, onFilter }: Props) {
  const isMobile = useIsMobile()

  const set = (key: keyof FilterState, val: string) =>
    onFilter({ ...filters, [key]: val })

  const hasActive = filters.provider || filters.productivity || filters.grade

  const body = (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Provider</p>
        <div className="flex gap-2">
          {(["", "github", "gitlab"] as const).map(p => (
            <button
              key={p}
              onClick={() => set("provider", p)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                filters.provider === p
                  ? "border-[#00d964] bg-[#00d964]/10 text-gray-900"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
              )}
            >
              {p === "github" && <GitHubIcon className="w-3.5 h-3.5 text-gray-600" />}
              {p === "gitlab" && <GitLabIcon className="w-3.5 h-3.5 text-[#fc6d26]" />}
              {p === "" ? "Semua" : p === "github" ? "GitHub" : "GitLab"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Productivity</p>
        <div className="flex flex-wrap gap-2">
          {["", ...PRODUCTIVITY_OPTIONS].map(p => (
            <button
              key={p}
              onClick={() => set("productivity", p)}
              className={cn(
                "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                filters.productivity === p
                  ? "border-[#00d964] bg-[#00d964]/10 text-gray-900"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
              )}
            >
              {p === "" ? "Semua" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Grade</p>
        <div className="flex flex-wrap gap-2">
          {["", ...GRADE_OPTIONS].map(g => (
            <button
              key={g}
              onClick={() => set("grade", g)}
              className={cn(
                "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                filters.grade === g
                  ? "border-[#00d964] bg-[#00d964]/10 text-gray-900"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
              )}
            >
              {g === "" ? "Semua" : `Grade ${g}`}
            </button>
          ))}
        </div>
      </div>
    </>
  )

  const footer = (
    <div className="flex gap-3 mt-2">
      {hasActive && (
        <Button
          className="flex-1 h-10 rounded-lg text-gray-900 font-bold bg-[#CACACA] hover:bg-[#b0b0b0]"
          onClick={() => onFilter({ provider: "", productivity: "", grade: "" })}
        >
          Reset
        </Button>
      )}
      <Button
        className="flex-1 h-10 rounded-lg bg-[#00D964] hover:bg-[#00c057] text-gray-900 font-bold"
        onClick={onClose}
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
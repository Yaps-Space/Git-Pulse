"use client"

import { RotateCw } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

interface Props {
  fullName:   string
  refreshing: boolean
  onRefresh:  (fullName: string) => void
  className?: string
}

export function RefreshButton({ fullName, refreshing, onRefresh, className }: Props) {
  return (
    <Button
      variant="outline"
      className={cn(
        "gap-2 border-gray-200 bg-white text-gray-700 hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964] disabled:opacity-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 transition-colors",
        className
      )}
      onClick={() => onRefresh(fullName)}
      disabled={refreshing}
    >
      <RotateCw className={`w-4 h-4 flex-shrink-0 ${refreshing ? "animate-spin" : ""}`} />
      {refreshing ? "Menganalisis..." : "Refresh Analysis"}
    </Button>
  )
}
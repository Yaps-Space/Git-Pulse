"use client"

import { RotateCw } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { useRefreshRepo } from "../hooks/useRefreshRepo"
import { cn } from "@/shared/lib/utils"

interface Props {
  id:        string
  fullName:  string
  className?: string
}

export function RefreshButton({ id, fullName, className }: Props) {
  const { loading, refresh } = useRefreshRepo(id)

  return (
    <Button
      variant="outline"
      className={cn(
        "gap-2 border-gray-200 bg-white text-gray-700 hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964] disabled:opacity-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 transition-colors",
        className
      )}
      onClick={() => refresh(fullName)}
      disabled={loading}
    >
      <RotateCw className={`w-4 h-4 flex-shrink-0 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Menganalisis..." : "Refresh Analysis"}
    </Button>
  )
}
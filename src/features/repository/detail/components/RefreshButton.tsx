"use client"

import { RotateCw } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { useRefreshRepo } from "../hooks/useRefreshRepo"

interface Props {
  id:       string
  fullName: string
}

export function RefreshButton({ id, fullName }: Props) {
  const { loading, refresh } = useRefreshRepo(id)

  return (
    <Button
      variant="outline"
      className="w-44 gap-2 border-gray-200 bg-white text-gray-700 hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964] disabled:opacity-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 transition-colors"
      onClick={() => refresh(fullName)}
      disabled={loading}
    >
      <RotateCw className={`w-4 h-4 flex-shrink-0 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Menganalisis..." : "Refresh Analysis"}
    </Button>
  )
}
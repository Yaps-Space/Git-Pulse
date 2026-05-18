"use client"

import { RotateCw } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { useRefreshRepo } from "../hooks/useRefreshRepo"

interface Props {
  fullName: string
}

export function RefreshButton({ fullName }: Props) {
  const { loading, refresh } = useRefreshRepo()

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={() => refresh(fullName)}
      disabled={loading}
    >
      <RotateCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Menganalisis..." : "Refresh Analysis"}
    </Button>
  )
}
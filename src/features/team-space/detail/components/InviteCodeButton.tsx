"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

interface Props {
  inviteCode: string
  className?: string
}

export function InviteCodeButton({ inviteCode, className }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="outline"
      className={cn("gap-2 border-gray-200 bg-white text-gray-700 hover:bg-[#00D964] transition-colors", className)}
      onClick={copy}
    >
      {copied
        ? <Check className="w-4 h-4 flex-shrink-0 text-gray-900" />
        : <Copy className="w-4 h-4 flex-shrink-0" />
      }
      Kode: <span className="font-mono font-bold tracking-widest">{inviteCode}</span>
    </Button>
  )
}
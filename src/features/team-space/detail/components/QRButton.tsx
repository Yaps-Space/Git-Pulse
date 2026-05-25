"use client"

import { QrCode } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import QRCode from "qrcode"

interface Props {
  inviteCode: string
  teamName:   string
  className?: string
}

export function QRButton({ inviteCode, teamName, className }: Props) {
  const handleDownload = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(inviteCode, {
        width:  512,
        margin: 2,
        color:  { dark: "#000000", light: "#ffffff" },
      })
      const link    = document.createElement("a")
      link.href     = dataUrl
      link.download = `qr-${teamName.replace(/\s+/g, "-").toLowerCase()}.png`
      link.click()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Button
      variant="outline"
      className={cn("gap-2 border-gray-200 bg-white text-gray-700 hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964] transition-colors", className)}
      onClick={handleDownload}
    >
      <QrCode className="w-4 h-4 flex-shrink-0" />
      QR
    </Button>
  )
}
"use client"

import { QrCode } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import QRCode from "qrcode"

interface Props {
  inviteCode: string
  teamName:   string
}

export function QRButton({ inviteCode, teamName }: Props) {
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
      onClick={handleDownload}
      className="gap-2 bg-[#00D964] hover:bg-[#00c057] text-gray-900 font-semibold"
    >
      <QrCode className="w-4 h-4" />
      QR
    </Button>
  )
}
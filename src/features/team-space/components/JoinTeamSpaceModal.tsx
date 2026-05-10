"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, QrCode, KeyRound } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { joinTeamSpace } from "../services/TeamSpaceService"

type Tab = "code" | "qr"

export default function JoinTeamSpaceModal({ onClose }: { onClose: () => void }) {
  const router                    = useRouter()
  const [tab,     setTab]         = useState<Tab>("code")
  const [code,    setCode]        = useState("")
  const [loading, setLoading]     = useState(false)
  const [error,   setError]       = useState("")

  const handleJoin = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError("")
    try {
      const data = await joinTeamSpace(code.trim())
      if (data.classId) {
        router.push(`/team-space/${data.classId}`)
        router.refresh()
      } else {
        setError(data.error || "Kode tidak valid")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl [&>button]:hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900">Join Team Space</DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex gap-2 mt-2 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setTab("code")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "code"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Kode
          </button>
          <button
            onClick={() => setTab("qr")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "qr"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <QrCode className="w-4 h-4" />
            QR Code
          </button>
        </div>

        {tab === "code" ? (
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-gray-700">Kode</Label>
              <Input
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setError("") }}
                placeholder="Contoh: 12KAJJA"
                className={`rounded-xl h-11 text-center font-mono tracking-widest ${error ? "border-red-400" : ""}`}
                maxLength={6}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-xl text-gray-600 font-bold"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-11 rounded-xl bg-[#00D964] hover:bg-[#00c057] text-gray-900 font-bold"
                onClick={handleJoin}
                disabled={loading || !code.trim()}
              >
                {loading ? "Bergabung..." : "Join"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 mt-2">
            <p className="text-sm text-gray-500 text-center">
              Scan QR Code yang diberikan oleh owner atau evaluator team space.
            </p>
            <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-300">
              <QrCode className="w-12 h-12" />
              <p className="text-xs text-center">Arahkan kamera ke QR Code</p>
            </div>
            <p className="text-xs text-gray-400 text-center">Fitur scan QR Code segera hadir</p>

            <Button
              variant="outline"
              className="w-full h-11 rounded-xl text-gray-600 font-bold"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
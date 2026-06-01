"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { X, QrCode, KeyRound, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input }  from "@/shared/components/ui/input"
import { Label }  from "@/shared/components/ui/label"
import { joinTeamSpace } from "../services/TeamSpaceService"

type Tab = "code" | "qr"

const SCANNER_DIV_ID = "qr-scanner-div"

export default function JoinTeamSpaceModal({ onClose }: { onClose: () => void }) {
  const router                      = useRouter()
  const [tab,       setTab]         = useState<Tab>("code")
  const [code,      setCode]        = useState("")
  const [loading,   setLoading]     = useState(false)
  const [error,     setError]       = useState("")
  const [scanning,  setScanning]    = useState(false)
  const [cameras,   setCameras]     = useState<{ id: string; label: string }[]>([])
  const [cameraIdx, setCameraIdx]   = useState(0)
  const scannerRef                  = useRef<InstanceType<typeof import("html5-qrcode").Html5Qrcode> | null>(null)

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch {}
      scannerRef.current = null
    }
    setScanning(false)
  }, [])

  const handleJoinWithCode = useCallback(async (inviteCode: string) => {
    setLoading(true)
    setError("")
    try {
      const data = await joinTeamSpace(inviteCode.trim())
      if (data.classId) {
        router.push(`/team-space/${data.classId}`)
        router.refresh()
      } else {
        setError(data.error || "Kode tidak valid")
        setTab("code")
        setCode(inviteCode)
      }
    } finally {
      setLoading(false)
    }
  }, [router])

  const startScanner = useCallback(async (camId: string) => {
    await stopScanner()

    // Tunggu sampai element ada di DOM
    await new Promise<void>(resolve => {
      const check = () => {
        if (document.getElementById(SCANNER_DIV_ID)) resolve()
        else setTimeout(check, 50)
      }
      check()
    })

    const { Html5Qrcode } = await import("html5-qrcode")
    const scanner         = new Html5Qrcode(SCANNER_DIV_ID)
    scannerRef.current    = scanner
    setScanning(true)
    try {
      await scanner.start(
        camId,
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (decodedText) => {
          await stopScanner()
          await handleJoinWithCode(decodedText.toUpperCase())
        },
        undefined
      )
    } catch {
      setScanning(false)
    }
  }, [stopScanner, handleJoinWithCode])

  useEffect(() => {
    if (tab !== "qr") { stopScanner(); return }

    const init = async () => {
      const { Html5Qrcode } = await import("html5-qrcode")
      const devices         = await Html5Qrcode.getCameras()
      if (devices.length === 0) return
      setCameras(devices)
      startScanner(devices[0].id)
    }
    init()

    return () => { stopScanner() }
  }, [tab, startScanner, stopScanner])

  const handleSwitchCamera = async () => {
    if (cameras.length < 2) return
    const next = (cameraIdx + 1) % cameras.length
    setCameraIdx(next)
    await startScanner(cameras[next].id)
  }

  const handleJoin = async () => {
    if (!code.trim()) return
    await handleJoinWithCode(code)
  }

  const handleClose = async () => {
    await stopScanner()
    onClose()
  }

  const currentCameraLabel = cameras[cameraIdx]?.label || ""
  const isBackCamera       = currentCameraLabel.toLowerCase().includes("back")
    || currentCameraLabel.toLowerCase().includes("rear")
    || currentCameraLabel.toLowerCase().includes("environment")
  const cameraDisplayName  = isBackCamera ? "Back Camera" : "Front Camera"

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl [&>button]:hidden">
        <DialogHeader>
          <div className="relative flex items-center justify-center">
            <DialogTitle className="text-xl font-bold text-gray-900">Join Team Space</DialogTitle>
            <button onClick={handleClose} className="absolute right-0 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex gap-0 mt-2 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setTab("code")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
              tab === "code" ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:text-gray-700"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Kode
          </button>
          <button
            onClick={() => setTab("qr")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
              tab === "qr" ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:text-gray-700"
            }`}
          >
            <QrCode className="w-4 h-4" />
            QR
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
                className={`rounded-lg h-10 text-center font-mono tracking-widest ${error ? "border-red-400" : ""}`}
                maxLength={6}
                onKeyDown={e => e.key === "Enter" && handleJoin()}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 h-10 rounded-lg text-gray-900 font-bold bg-[#CACACA] hover:bg-[#b0b0b0]"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-10 rounded-lg bg-[#00D964] hover:bg-[#00c057] text-gray-900 font-bold"
                onClick={handleJoin}
                disabled={loading || !code.trim()}
              >
                {loading ? "Bergabung..." : "Join"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-2">
            <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ height: 300 }}>
              <div id={SCANNER_DIV_ID} className="w-full h-full" />

              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-sm">Memuat kamera...</p>
                </div>
              )}

              {scanning && cameras.length > 0 && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1.5 rounded-lg">
                  <span className="text-white text-xs font-medium">{cameraDisplayName}</span>
                </div>
              )}

              {cameras.length > 1 && (
                <button
                  onClick={handleSwitchCamera}
                  className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center">
              Arahkan kamera ke QR Code yang diberikan owner atau evaluator
            </p>

            <Button
              className="w-full h-10 rounded-lg text-gray-900 font-bold bg-[#CACACA] hover:bg-[#b0b0b0]"
              onClick={handleClose}
            >
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
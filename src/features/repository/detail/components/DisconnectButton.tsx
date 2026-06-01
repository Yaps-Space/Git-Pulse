"use client"

import { useState } from "react"
import { Unplug, AlertTriangle } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { useDisconnectRepo } from "../hooks/useDisconnectRepo"
import { cn } from "@/shared/lib/utils"

interface Props {
  id:         string
  fullName:   string
  className?: string
}

export function DisconnectButton({ id, fullName, className }: Props) {
  const { loading, disconnect }       = useDisconnectRepo()
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "gap-2 border-gray-200 transition-colors",
          showConfirm
            ? "bg-[#BB230B] text-white"
            : "bg-white text-gray-700 hover:bg-[#BB230B] hover:text-white",
          className
        )}
        onClick={() => setShowConfirm(true)}
      >
        <Unplug className="w-4 h-4 flex-shrink-0" />
        Disconnect
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm">

          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-[#BB230B]" />
            </div>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center text-lg font-semibold">
                Disconnect Repository?
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-500 text-center">
              <span className="font-medium text-gray-900">{fullName}</span> akan dihapus dari GitPulse. Data analisis akan ikut terhapus dan tidak bisa dikembalikan.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 h-10 rounded-lg text-gray-900 font-bold bg-[#CACACA] hover:bg-[#b0b0b0]"
              disabled={loading}
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-10 rounded-lg text-white font-bold bg-[#BB230B] hover:bg-[#A21C06] disabled:opacity-70"
              disabled={loading}
              onClick={() => disconnect(id)}
            >
              {loading ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
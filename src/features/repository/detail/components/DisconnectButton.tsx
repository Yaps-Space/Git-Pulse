"use client"

import { useState } from "react"
import { Unplug, AlertTriangle } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
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
            ? "bg-red-50 text-red-500 border-red-200"
            : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-500 hover:border-red-200",
          className
        )}
        onClick={() => setShowConfirm(true)}
      >
        <Unplug className="w-4 h-4 flex-shrink-0" />
        Disconnect
      </Button>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">
                Disconnect Repository?
              </h3>
              <p className="text-sm text-gray-500 text-center">
                <span className="font-medium text-gray-900">{fullName}</span> akan dihapus dari GitPulse. Data analisis akan ikut terhapus dan tidak bisa dikembalikan.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                disabled={loading}
                onClick={() => setShowConfirm(false)}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:opacity-70"
                disabled={loading}
                onClick={() => disconnect(id)}
              >
                {loading ? "Menghapus..." : "Disconnect"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
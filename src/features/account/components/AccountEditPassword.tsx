"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2, X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { toast } from "sonner"

interface Props {
  hasPassword: boolean
}

export function AccountEditPassword({ hasPassword }: Props) {
  const [open,            setOpen]        = useState(false)
  const [currentPassword, setCurrentPass] = useState("")
  const [newPassword,     setNewPass]     = useState("")
  const [confirmPassword, setConfirmPass] = useState("")
  const [showCurrent,     setShowCurrent] = useState(false)
  const [showNew,         setShowNew]     = useState(false)
  const [showConfirm,     setShowConfirm] = useState(false)
  const [loading,         setLoading]     = useState(false)

  const handleClose = () => {
    setOpen(false)
    setCurrentPass("")
    setNewPass("")
    setConfirmPass("")
    setShowCurrent(false)
    setShowNew(false)
    setShowConfirm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak sama.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/account/update", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...(hasPassword ? { currentPassword } : {}),
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? "Gagal memperbarui password.")
        return
      }

      toast.success("Password berhasil diperbarui.")
      handleClose()
    } catch {
      toast.error("Tidak bisa menghubungi server.")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-3 h-10 outline-none focus:border-[#00d964] transition-colors"

  return (
    <div>
      <Separator className="my-5" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700">Password</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {hasPassword ? "Ubah password akun kamu" : "Set password untuk bisa login tanpa OAuth"}
          </p>
        </div>
        <Button variant="outline" size="sm" className="text-xs hover:bg-[#00d964]" onClick={() => setOpen(true)}>
          {hasPassword ? "Ubah" : "Set Password"}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm rounded-2xl [&>button]:hidden">
          <DialogHeader>
            <div className="relative flex items-center justify-center">
              <DialogTitle className="text-lg font-bold text-gray-900">
                {hasPassword ? "Ubah Password" : "Set Password"}
              </DialogTitle>
              <button onClick={handleClose} className="absolute right-0 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
            {hasPassword && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Password Saat Ini <span className="text-[#BB230B]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={inputClass}
                    style={{ paddingRight: "40px" }}
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Password Baru <span className="text-[#BB230B]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Min. 8 karakter"
                  required
                  minLength={8}
                  className={inputClass}
                  style={{ paddingRight: "40px" }}
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Konfirmasi Password Baru <span className="text-[#BB230B]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Ulangi password baru"
                  required
                  className={inputClass}
                  style={{ paddingRight: "40px" }}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <Button
                type="button"
                className="flex-1 h-10 rounded-lg text-gray-900 font-bold bg-[#CACACA] hover:bg-[#b0b0b0]"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-10 rounded-lg bg-[#00D964] hover:bg-[#00c057] text-gray-900 font-bold"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
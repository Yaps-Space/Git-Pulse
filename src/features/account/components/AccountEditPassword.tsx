"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"

interface Props {
  hasPassword: boolean // true = credentials user, false = OAuth user
}

export function AccountEditPassword({ hasPassword }: Props) {
  const [open, setOpen]                   = useState(false)
  const [currentPassword, setCurrentPass] = useState("")
  const [newPassword, setNewPass]         = useState("")
  const [confirmPassword, setConfirmPass] = useState("")
  const [showCurrent, setShowCurrent]     = useState(false)
  const [showNew, setShowNew]             = useState(false)
  const [loading, setLoading]             = useState(false)
  const [message, setMessage]             = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Password baru dan konfirmasi tidak sama." })
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
        setMessage({ type: "error", text: data.error ?? "Gagal memperbarui password." })
        return
      }

      setMessage({ type: "success", text: "Password berhasil diperbarui." })
      setCurrentPass("")
      setNewPass("")
      setConfirmPass("")
      setOpen(false)
    } catch {
      setMessage({ type: "error", text: "Tidak bisa menghubungi server." })
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width:        "100%",
    padding:      "9px 14px",
    fontSize:     "14px",
    borderRadius: "10px",
    border:       "1px solid #e5e7eb",
    outline:      "none",
    background:   "white",
    color:        "#111827",
    transition:   "border-color 0.15s",
  } as React.CSSProperties

  return (
    <div>
      <Separator className="my-5" />

      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-sm font-semibold text-gray-700">Password</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {hasPassword ? "Ubah password akun kamu" : "Set password untuk bisa login tanpa OAuth"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => { setOpen(!open); setMessage(null) }}
        >
          {open ? "Batal" : hasPassword ? "Ubah" : "Set Password"}
        </Button>
      </div>

      {message && (
        <div className={`mt-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
          message.type === "error"
            ? "bg-red-50 text-red-600 border border-red-100"
            : "bg-green-50 text-green-700 border border-green-100"
        }`}>
          {message.text}
        </div>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          {/* Current password — hanya tampil kalau sudah punya password */}
          {hasPassword && (
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Password Saat Ini</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ ...inputStyle, paddingRight: "40px" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#00d964")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "#e5e7eb")}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Password Baru</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Min. 8 karakter"
                required
                minLength={8}
                style={{ ...inputStyle, paddingRight: "40px" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#00d964")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Ulangi password baru"
              required
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#00d964")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full gap-2 font-medium text-gray-900 border-0 hover:brightness-110 transition-all"
            style={{ background: "#00d964", opacity: loading ? 0.7 : 1 }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Menyimpan..." : "Simpan Password"}
          </Button>
        </form>
      )}
    </div>
  )
}
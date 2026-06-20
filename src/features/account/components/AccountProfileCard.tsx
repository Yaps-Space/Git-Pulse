"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Separator } from "@/shared/components/ui/separator"
import { Github, CheckCircle2, Loader2, Pencil } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { INFO_ITEMS } from "../constants/ProfileIcon"
import { useIsMobile } from "@/shared/hooks/UseMobile"
import { AccountData } from "../types/Account"
import { AccountEditPassword } from "./AccountEditPassword"

function GitLabIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51 1.22 3.78a.84.84 0 0 1-.3.92z"/>
    </svg>
  )
}

export function AccountProfileCard({ name, username, email, avatar, createdAt, linkedProviders, hasPassword }: AccountData) {
  const isMobile = useIsMobile()
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  const params   = useSearchParams()

  const [toast, setToast]         = useState<string | null>(null)
  const [editingName, setEditing] = useState(false)
  const [nameValue, setNameValue] = useState(name)
  const [savingName, setSaving]   = useState(false)

  const isGithubConnected = !!linkedProviders?.github?.accessToken
  const isGitlabConnected = !!linkedProviders?.gitlab?.accessToken

  useEffect(() => {
    const connected = params.get("connected")
    const error     = params.get("error")

    if (connected === "github") setToast("GitHub berhasil dihubungkan!")
    if (connected === "gitlab") setToast("GitLab berhasil dihubungkan!")
    if (error)                  setToast("Gagal menghubungkan akun. Coba lagi.")

    if (connected || error) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [params])

  const handleSaveName = async () => {
    if (!nameValue.trim() || nameValue === name) {
      setEditing(false)
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/account/update", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: nameValue }),
      })

      if (res.ok) {
        setToast("Nama berhasil diperbarui.")
        setEditing(false)
      } else {
        const data = await res.json()
        setToast(data.error ?? "Gagal memperbarui nama.")
      }
    } catch {
      setToast("Tidak bisa menghubungi server.")
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 4000)
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      {!isMobile && (
        <>
          <div className="flex items-center gap-4 mb-1">
            <Avatar className="w-12 h-12 border-1 border-gray-100 flex-shrink-0">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="bg-gray-900 text-white text-sm font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-gray-900">{nameValue}</h2>
              <p className="text-sm text-gray-400">@{username}</p>
            </div>
          </div>
          <Separator className="my-4.5" />
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className={`mb-4 px-4 py-2.5 rounded-xl text-sm font-medium ${
          toast.includes("Gagal") || toast.includes("salah") || toast.includes("bisa")
            ? "bg-red-50 text-red-600 border border-red-100"
            : "bg-green-50 text-green-700 border border-green-100"
        }`}>
          {toast}
        </div>
      )}

      {/* Info items */}
      <div className={isMobile ? "space-y-3" : "space-y-4"}>
        {INFO_ITEMS(username, email, createdAt).map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400">{label}</p>
              <p className="text-sm font-medium text-gray-900">{value}</p>
            </div>
          </div>
        ))}

        {/* Edit nama */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <Pencil className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-1">Nama</p>
            {editingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="flex-1 text-sm font-medium text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#00d964]"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditing(false) }}
                />
                <Button size="sm" disabled={savingName} onClick={handleSaveName}
                  className="text-xs text-gray-900 border-0" style={{ background: "#00d964" }}>
                  {savingName ? <Loader2 className="w-3 h-3 animate-spin" /> : "Simpan"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setEditing(false); setNameValue(name) }}
                  className="text-xs">
                  Batal
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">{nameValue}</p>
                <button onClick={() => setEditing(true)}
                  className="text-gray-300 hover:text-gray-500 transition-colors">
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit password */}
      <AccountEditPassword hasPassword={hasPassword} />

      <Separator className="my-5" />

      {/* Connected Accounts */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Connected Accounts</p>
        <div className="flex flex-col gap-2">

          {isGithubConnected ? (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2.5">
                <Github className="w-4 h-4 text-gray-700" />
                <div>
                  <p className="text-sm font-medium text-gray-800">GitHub</p>
                  {linkedProviders.github?.username && (
                    <p className="text-xs text-gray-400">@{linkedProviders.github.username}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected
              </div>
            </div>
          ) : (
            <a href="/api/auth/connect/github/init">
              <Button variant="outline" className="w-full gap-2 justify-start font-medium text-gray-700 border-gray-200 hover:bg-gray-50">
                <Github className="w-4 h-4" />
                Connect GitHub
              </Button>
            </a>
          )}

          {isGitlabConnected ? (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-orange-100 bg-orange-50/50">
              <div className="flex items-center gap-2.5">
                <GitLabIcon className="w-4 h-4 text-[#fc6d26]" />
                <div>
                  <p className="text-sm font-medium text-gray-800">GitLab</p>
                  {linkedProviders.gitlab?.username && (
                    <p className="text-xs text-gray-400">@{linkedProviders.gitlab.username}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected
              </div>
            </div>
          ) : (
            <a href="/api/auth/connect/gitlab/init">
              <Button variant="outline" className="w-full gap-2 justify-start font-medium text-gray-700 border-gray-200 hover:bg-gray-50">
                <GitLabIcon className="w-4 h-4 text-[#fc6d26]" />
                Connect GitLab
              </Button>
            </a>
          )}

        </div>
      </div>
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Separator } from "@/shared/components/ui/separator"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog"
import { Pencil, User, Link2, Unlink, AlertTriangle } from "lucide-react"
import { INFO_ITEMS } from "../constants/ProfileIcon"
import { useIsMobile } from "@/shared/hooks/UseMobile"
import { useAccount } from "../hooks/UseAccount"
import { AccountData } from "../types/Account"
import { AccountEditPassword } from "./AccountEditPassword"
import { EditNameDialog } from "./EditNameDialog"
import { GitHubIcon, GitLabIcon } from "@/shared/components/commons/ProviderIcons"
import { toast } from "sonner"

type ProviderKey = "github" | "gitlab"
type DisconnectTarget = ProviderKey | null

const PROVIDER_LABEL: Record<ProviderKey, string> = {
  github: "GitHub",
  gitlab: "GitLab",
}

const PROVIDER_CONFIG: {
  key:         ProviderKey
  Icon:        typeof GitHubIcon
  iconColor:   string
  iconColorMuted: string
}[] = [
  { key: "github", Icon: GitHubIcon, iconColor: "text-gray-700", iconColorMuted: "text-gray-400" },
  { key: "gitlab", Icon: GitLabIcon, iconColor: "text-[#fc6d26]", iconColorMuted: "text-[#fc6d26]/50" },
]

export function AccountProfileCard({ name, username, email, avatar, createdAt, linkedProviders, hasPassword, onNameChange }: AccountData) {
  const isMobile    = useIsMobile()
  const initials    = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  const params      = useSearchParams()
  const pathname    = usePathname()
  const { update }  = useSession()
  const router      = useRouter()
  const { refresh } = useAccount()

  const [editOpen,         setEditOpen]         = useState(false)
  const [nameValue,        setNameValue]        = useState(name)
  const [nameInput,        setNameInput]        = useState(name)
  const [savingName,       setSaving]           = useState(false)
  const [disconnectTarget, setDisconnectTarget] = useState<DisconnectTarget>(null)
  const [disconnecting,    setDisconnecting]    = useState(false)
  const [blockedMessage,   setBlockedMessage]   = useState<string | null>(null)

  const isConnected: Record<ProviderKey, boolean> = {
    github: !!linkedProviders?.github?.accessToken,
    gitlab: !!linkedProviders?.gitlab?.accessToken,
  }

  useEffect(() => {
    const connected = params.get("connected") as ProviderKey | null
    const error      = params.get("error")
    if (!connected && !error) return

    if (connected) { toast.success(`${PROVIDER_LABEL[connected]} berhasil dihubungkan!`); refresh() }
    if (error === "provider_taken") toast.error("Akun ini sudah terhubung ke akun GitPulse lain.")
    else if (error)                 toast.error("Gagal menghubungkan akun. Coba lagi.")

    router.replace(pathname)
  }, [params, refresh, pathname, router])

  const handleSaveName = async () => {
    if (!nameInput.trim()) { toast.error("Nama tidak boleh kosong."); return }
    if (nameInput === nameValue) { setEditOpen(false); return }
    setSaving(true)
    try {
      const res = await fetch("/api/account/update", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: nameInput }),
      })
      if (res.ok) {
        await update({ name: nameInput })
        router.refresh()
        setNameValue(nameInput)
        onNameChange?.(nameInput)
        setEditOpen(false)
        toast.success("Nama berhasil diperbarui.")
      } else {
        const data = await res.json()
        toast.error(data.error ?? "Gagal memperbarui nama.")
      }
    } catch {
      toast.error("Tidak bisa menghubungi server.")
    } finally {
      setSaving(false)
    }
  }

  const canDisconnect = (provider: ProviderKey): boolean => {
    if (hasPassword) return true
    const other: ProviderKey = provider === "github" ? "gitlab" : "github"
    return isConnected[other]
  }

  const handleDisconnectRequest = (provider: ProviderKey) => {
    if (!canDisconnect(provider)) {
      const other: ProviderKey = provider === "github" ? "gitlab" : "github"
      setBlockedMessage(
        `You don't have a password set for this account. Before disconnecting ${PROVIDER_LABEL[provider]}, please set a password or connect ${PROVIDER_LABEL[other]} as an alternative login.`
      )
      return
    }
    setDisconnectTarget(provider)
  }

  const handleDisconnect = async () => {
    if (!disconnectTarget) return
    setDisconnecting(true)
    try {
      const res = await fetch(`/api/account/disconnect/${disconnectTarget}`, { method: "POST" })
      if (res.ok) {
        await refresh()
        toast.success(`${PROVIDER_LABEL[disconnectTarget]} disconnected successfully.`)
        setDisconnectTarget(null)
      } else {
        const data = await res.json()
        toast.error(data.error ?? "Failed to disconnect.")
      }
    } catch {
      toast.error("Could not reach server.")
    } finally {
      setDisconnecting(false)
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

      <div className={isMobile ? "space-y-3" : "space-y-4"}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-400">Nama</p>
            <p className="text-sm font-medium text-gray-900">{nameValue}</p>
          </div>
          <button
            onClick={() => { setNameInput(nameValue); setEditOpen(true) }}
            className="text-gray-300 hover:text-[#00d964] transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

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
      </div>

      <EditNameDialog
        open    ={editOpen}
        value   ={nameInput}
        saving  ={savingName}
        onChange={setNameInput}
        onSave  ={handleSaveName}
        onClose ={() => setEditOpen(false)}
      />

      <AccountEditPassword hasPassword={hasPassword} />

      <Separator className="my-5" />

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Connected Accounts</p>
        <div className="flex flex-col gap-2">
          {PROVIDER_CONFIG.map(({ key, Icon, iconColor, iconColorMuted }) => {
            const connected = isConnected[key]
            const username  = linkedProviders?.[key]?.username

            return connected ? (
              <div key={key} className="flex items-center justify-between px-4 py-3 rounded-xl border border-green-100 bg-green-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-100 flex-shrink-0">
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{PROVIDER_LABEL[key]}</p>
                    {username && <p className="text-xs text-gray-400">@{username}</p>}
                  </div>
                </div>
                <button
                  onClick={() => handleDisconnectRequest(key)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#BB230B] font-medium transition-colors"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  Disconnect
                </button>
              </div>
            ) : (
              <Link key={key} href={`/api/auth/connect/${key}/init`}>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 flex-shrink-0">
                      <Icon className={`w-4 h-4 ${iconColorMuted}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">{PROVIDER_LABEL[key]}</p>
                      <p className="text-xs text-gray-400">Belum terhubung</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                    <Link2 className="w-3.5 h-3.5" />
                    Connect
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <Dialog open={!!disconnectTarget} onOpenChange={v => !v && setDisconnectTarget(null)}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-[#BB230B]" />
            </div>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center text-lg font-semibold">
                Disconnect {disconnectTarget && PROVIDER_LABEL[disconnectTarget]}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-500 text-center">
              Repository yang sudah terhubung tidak akan terhapus, tapi tidak bisa dianalisis ulang
              sampai kamu menghubungkan kembali akun {disconnectTarget && PROVIDER_LABEL[disconnectTarget]}.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => setDisconnectTarget(null)}
              disabled={disconnecting}
              className="flex-1 h-10 rounded-lg text-gray-900 font-bold bg-[#CACACA] hover:bg-[#b0b0b0]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="flex-1 h-10 rounded-lg text-white font-bold bg-[#BB230B] hover:bg-[#A21C06]"
            >
              {disconnecting ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!blockedMessage} onOpenChange={v => !v && setBlockedMessage(null)}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-[#BB230B]" />
            </div>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center text-lg font-semibold">
                Tidak Bisa Disconnect
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-500 text-center">{blockedMessage}</p>
          </div>
          <Button
            onClick={() => setBlockedMessage(null)}
            className="w-full h-10 rounded-lg bg-[#00D964] hover:bg-[#00c057] text-gray-900 font-bold mt-2"
          >
            Oke
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
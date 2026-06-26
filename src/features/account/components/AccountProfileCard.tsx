"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Separator } from "@/shared/components/ui/separator"
import { CheckCircle2, Pencil, User, Link2 } from "lucide-react"
import { INFO_ITEMS } from "../constants/ProfileIcon"
import { useIsMobile } from "@/shared/hooks/UseMobile"
import { AccountData } from "../types/Account"
import { AccountEditPassword } from "./AccountEditPassword"
import { EditNameDialog } from "./EditNameDialog"
import { GitHubIcon, GitLabIcon } from "@/shared/components/commons/ProviderIcons"
import { toast } from "sonner"

export function AccountProfileCard({ name, username, email, avatar, createdAt, linkedProviders, hasPassword }: AccountData) {
  const isMobile   = useIsMobile()
  const initials   = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  const params     = useSearchParams()
  const { update } = useSession()
  const router     = useRouter()

  const [editOpen,   setEditOpen]  = useState(false)
  const [nameValue,  setNameValue] = useState(name)
  const [nameInput,  setNameInput] = useState(name)
  const [savingName, setSaving]    = useState(false)

  const isGithubConnected = !!linkedProviders?.github?.accessToken
  const isGitlabConnected = !!linkedProviders?.gitlab?.accessToken

  useEffect(() => {
    const connected = params.get("connected")
    const error     = params.get("error")

    if (connected === "github") toast.success("GitHub berhasil dihubungkan!")
    if (connected === "gitlab") toast.success("GitLab berhasil dihubungkan!")
    if (error)                  toast.error("Gagal menghubungkan akun. Coba lagi.")
  }, [params])

  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      toast.error("Nama tidak boleh kosong.")
      return
    }

    if (nameInput === nameValue) {
      setEditOpen(false)
      return
    }

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
          {isGithubConnected ? (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-green-100 bg-green-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-100 flex-shrink-0">
                  <GitHubIcon className="w-4 h-4 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">GitHub</p>
                  {linkedProviders.github?.username && (
                    <p className="text-xs text-gray-400">@{linkedProviders.github.username}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#00d964] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected
              </div>
            </div>
          ) : (
            <Link href="/api/auth/connect/github/init">
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 flex-shrink-0">
                    <GitHubIcon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">GitHub</p>
                    <p className="text-xs text-gray-400">Belum terhubung</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                  <Link2 className="w-3.5 h-3.5" />
                  Hubungkan
                </div>
              </div>
            </Link>
          )}

          {isGitlabConnected ? (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-green-100 bg-green-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-100 flex-shrink-0">
                  <GitLabIcon className="w-4 h-4 text-[#fc6d26]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">GitLab</p>
                  {linkedProviders.gitlab?.username && (
                    <p className="text-xs text-gray-400">@{linkedProviders.gitlab.username}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#00d964] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected
              </div>
            </div>
          ) : (
            <Link href="/api/auth/connect/gitlab/init">
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 flex-shrink-0">
                    <GitLabIcon className="w-4 h-4 text-[#fc6d26]/50" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">GitLab</p>
                    <p className="text-xs text-gray-400">Belum terhubung</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                  <Link2 className="w-3.5 h-3.5" />
                  Hubungkan
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
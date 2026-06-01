"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Check } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input }  from "@/shared/components/ui/input"
import { Label }  from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { createTeamSpace, fetchRepos, fetchRepoContributors, Contributor } from "../services/TeamSpaceService"

interface Repo {
  id:       string;
  fullName: string;
}

export default function CreateTeamSpaceModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [name,          setName]          = useState("")
  const [description,   setDescription]   = useState("")
  const [repoFullName,  setRepoFullName]  = useState("")
  const [repos,         setRepos]         = useState<Repo[]>([])
  const [loading,       setLoading]       = useState(false)
  const [loadingRepos,  setLoadingRepos]  = useState(true)
  const [contributors,  setContributors]  = useState<Contributor[]>([])
  const [loadingContributors, setLoadingContributors] = useState(false)
  const [selectedLogins, setSelectedLogins] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchRepos()
      .then(setRepos)
      .finally(() => setLoadingRepos(false))
  }, [])

  useEffect(() => {
    if (!repoFullName) { setContributors([]); setSelectedLogins(new Set()); return }
    setLoadingContributors(true)
    fetchRepoContributors(repoFullName)
      .then(setContributors)
      .finally(() => setLoadingContributors(false))
  }, [repoFullName])

  const toggleAll = () => {
    if (allSelected) {
      setSelectedLogins(new Set())
    } else {
      setSelectedLogins(new Set(contributors.filter(c => c.isRegistered).map(c => c.login)))
    }
  }

  const allSelected = contributors.filter(c => c.isRegistered).length > 0 &&
    selectedLogins.size === contributors.filter(c => c.isRegistered).length

  const toggleOne = (login: string) => {
    setSelectedLogins(prev => {
      const next = new Set(prev)
      if (next.has(login)) next.delete(login)
      else next.add(login)
      return next
    })
  }

  const handleSubmit = async () => {
    if (!name || !repoFullName) return
    setLoading(true)
    try {
      const data = await createTeamSpace({
        name,
        description,
        repoFullName,
        importLogins: Array.from(selectedLogins),
      })
      if (data.id) {
        router.push(`/team-space/${data.id}`)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl [&>button]:hidden">
        <DialogHeader>
          <div className="relative flex items-center justify-center">
            <DialogTitle className="text-xl font-bold text-gray-900">Create Team Space</DialogTitle>
            <button onClick={onClose} className="absolute right-0 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-gray-700">Nama Team Space</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Kajja Tim"
              className="rounded-lg h-10 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-gray-700">Deskripsi</Label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Contoh: Tim Kajja dibentuk untuk mengerjakan projek."
              className="rounded-lg h-10 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-gray-700">Repository</Label>
            {loadingRepos ? (
              <p className="text-sm text-gray-400">Memuat repo...</p>
            ) : (
              <Select value={repoFullName} onValueChange={setRepoFullName}>
                <SelectTrigger className="w-full rounded-lg !h-10 text-sm px-3 border border-input [&>span]:text-sm">
                  <SelectValue placeholder="Pilih repository" />
                </SelectTrigger>
                <SelectContent>
                  {repos.map((r) => (
                    <SelectItem key={r.id} value={r.fullName}>{r.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-gray-400">Hanya repo yang sudah diconnect</p>
          </div>

          {repoFullName && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Import Member</Label>
                {contributors.length > 0 && (
                  <button
                    onClick={toggleAll}
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {allSelected ? "Batal semua" : "Pilih semua"}
                  </button>
                )}
              </div>

              {loadingContributors ? (
                <p className="text-sm text-gray-400">Memuat kontributor...</p>
              ) : contributors.length === 0 ? (
                <p className="text-sm text-gray-400">Tidak ada kontributor ditemukan</p>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                  {contributors.map(c => {
                    const selected = selectedLogins.has(c.login)
                    return (
                      <button
                        key={c.login}
                        onClick={() => c.isRegistered && toggleOne(c.login)}
                        disabled={!c.isRegistered}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors border-b border-gray-100 last:border-0 ${
                          c.isRegistered
                            ? "hover:bg-gray-50 cursor-pointer"
                            : "opacity-50 cursor-not-allowed bg-gray-50"
                        }`}
                      >
                        <Image src={c.avatar_url} alt={c.login} width={28} height={28} className="rounded-full flex-shrink-0" />
                        <div className="flex-1 text-left min-w-0">
                          <span className="text-sm text-gray-900 block">@{c.login}</span>
                          {!c.isRegistered && (
                            <span className="text-[10px] text-gray-400">Belum terdaftar di GitPulse</span>
                          )}
                        </div>
                        <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                          selected ? "bg-[#00D964] border-[#00D964]" : "border-gray-300"
                        }`}>
                          {selected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
              <p className="text-xs text-gray-400">
                {selectedLogins.size > 0
                  ? `${selectedLogins.size} member dipilih`
                  : "Lewati untuk tidak mengimport member sekarang"}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-2">
          <Button
            className="flex-1 h-10 rounded-lg text-gray-900 font-bold bg-[#CACACA] hover:bg-[#b0b0b0]"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-10 rounded-lg bg-[#00D964] hover:bg-[#00c057] text-gray-900 font-bold"
            onClick={handleSubmit}
            disabled={loading || !name || !repoFullName}
          >
            {loading ? "Membuat..." : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
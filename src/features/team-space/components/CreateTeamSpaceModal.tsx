"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { X, Check, ChevronDown } from "lucide-react"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command"
import { createTeamSpace, fetchRepos, fetchRepoContributors, Contributor } from "../services/TeamSpaceService"
import { cn } from "@/shared/lib/utils"

interface Repo {
  id:       string
  fullName: string
}

export default function CreateTeamSpaceModal({ onClose }: { onClose: () => void }) {
  const router            = useRouter()
  const { data: session } = useSession()

  const [name,               setName]               = useState("")
  const [description,        setDescription]        = useState("")
  const [selectedRepos,      setSelectedRepos]      = useState<string[]>([])
  const [repos,              setRepos]              = useState<Repo[]>([])
  const [loading,            setLoading]            = useState(false)
  const [loadingRepos,       setLoadingRepos]       = useState(true)
  const [contributors,       setContributors]       = useState<Contributor[]>([])
  const [loadingContributors,setLoadingContributors]= useState(false)
  const [selectedLogins,     setSelectedLogins]     = useState<Set<string>>(new Set())
  const [repoOpen,           setRepoOpen]           = useState(false)

  useEffect(() => {
    fetchRepos()
      .then(setRepos)
      .finally(() => setLoadingRepos(false))
  }, [])

  // Fetch contributors dari semua repo yang dipilih (gabungan unik)
  useEffect(() => {
    if (selectedRepos.length === 0) { setContributors([]); setSelectedLogins(new Set()); return }
    setLoadingContributors(true)

    Promise.all(selectedRepos.map(r => fetchRepoContributors(r)))
      .then(results => {
        const merged = new Map<string, Contributor>()
        results.flat().forEach(c => { if (!merged.has(c.login)) merged.set(c.login, c) })
        setContributors(Array.from(merged.values()))
      })
      .finally(() => setLoadingContributors(false))
  }, [selectedRepos])

  const registeredNonOwner = contributors.filter(c =>
    c.isRegistered && c.login.toLowerCase() !== session?.user?.username?.toLowerCase()
  )

  const allSelected = registeredNonOwner.length > 0 &&
    selectedLogins.size === registeredNonOwner.length

  const toggleAll = () => {
    if (allSelected) setSelectedLogins(new Set())
    else setSelectedLogins(new Set(registeredNonOwner.map(c => c.login)))
  }

  const toggleOne = (login: string) => {
    setSelectedLogins(prev => {
      const next = new Set(prev)
      if (next.has(login)) next.delete(login)
      else next.add(login)
      return next
    })
  }

  const toggleRepo = (fullName: string) => {
    setSelectedRepos(prev =>
      prev.includes(fullName)
        ? prev.filter(r => r !== fullName)
        : [...prev, fullName]
    )
  }

  const handleSubmit = async () => {
    if (!name || selectedRepos.length === 0) return
    setLoading(true)
    try {
      const data = await createTeamSpace({
        name,
        description,
        repoFullNames: selectedRepos,
        importLogins:  Array.from(selectedLogins),
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
            <Label className="text-sm font-medium text-gray-700">
              Nama Team Space <span className="text-[#BB230B]">*</span>
            </Label>
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
            <Label className="text-sm font-medium text-gray-700">
              Repository <span className="text-[#BB230B]">*</span>
            </Label>
            {loadingRepos ? (
              <p className="text-sm text-gray-400">Memuat repo...</p>
            ) : (
              <Popover open={repoOpen} onOpenChange={setRepoOpen} modal={false}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full flex items-center justify-between min-h-10 px-3 py-2 rounded-lg border border-input text-sm transition-colors hover:bg-accent text-left",
                      selectedRepos.length === 0 && "text-muted-foreground"
                    )}
                  >
                    <span className="flex flex-wrap gap-1 flex-1 min-w-0">
                      {selectedRepos.length === 0 ? (
                        "Pilih repository"
                      ) : (
                        selectedRepos.map(r => (
                          <span key={r} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-md truncate max-w-[160px]">
                            {r}
                          </span>
                        ))
                      )}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Cari repository..." className="h-9 text-sm" />
                    <CommandList>
                      <CommandEmpty className="py-3 text-center text-sm text-gray-400">
                        Repository tidak ditemukan
                      </CommandEmpty>
                      <CommandGroup>
                        {repos.map(r => (
                          <CommandItem
                            key={r.id}
                            value={r.fullName}
                            onSelect={(val: string) => {
                              const matched = repos.find(repo => repo.fullName.toLowerCase() === val.toLowerCase())
                              if (matched) toggleRepo(matched.fullName)
                            }}
                            className="text-sm"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 flex-shrink-0",
                                selectedRepos.includes(r.fullName) ? "opacity-100 text-[#00D964]" : "opacity-0"
                              )}
                            />
                            {r.fullName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
            <p className="text-xs text-gray-400">
              {selectedRepos.length > 0
                ? `${selectedRepos.length} repository dipilih`
                : "Hanya repo yang sudah diconnect. Bisa pilih lebih dari satu."}
            </p>
          </div>

          {selectedRepos.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Import Member</Label>
                {registeredNonOwner.length > 0 && (
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
                    const isOwner  = c.login.toLowerCase() === session?.user?.username?.toLowerCase()
                    const selected = selectedLogins.has(c.login)
                    const disabled = isOwner || !c.isRegistered

                    return (
                      <button
                        key={c.login}
                        onClick={() => !disabled && toggleOne(c.login)}
                        disabled={disabled}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors border-b border-gray-100 last:border-0 ${
                          disabled
                            ? "opacity-50 cursor-not-allowed bg-gray-50"
                            : "hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        <Image src={c.avatar_url} alt={c.login} width={28} height={28} className="rounded-full flex-shrink-0" />
                        <div className="flex-1 text-left min-w-0">
                          <span className="text-sm text-gray-900 block">@{c.login}</span>
                          {isOwner ? (
                            <span className="text-[10px] text-[#00D964]">(Anda)</span>
                          ) : !c.isRegistered ? (
                            <span className="text-[10px] text-gray-400">Belum terdaftar di GitPulse</span>
                          ) : null}
                        </div>
                        <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                          isOwner  ? "bg-gray-200 border-gray-200" :
                          selected ? "bg-[#00D964] border-[#00D964]" :
                                     "border-gray-300"
                        }`}>
                          {selected && !isOwner && <Check className="w-3 h-3 text-white" />}
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
            disabled={loading || !name || selectedRepos.length === 0}
          >
            {loading ? "Membuat..." : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
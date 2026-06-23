"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { X, Plus, Check } from "lucide-react"
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
import { cn } from "@/shared/lib/utils"
import { InfiniteCombobox, ComboboxOption } from "@/shared/components/commons/InfiniteCombobox"
import { GitHubIcon, GitLabIcon } from "@/shared/components/commons/ProviderIcons"
import { createTeamSpace, fetchRepos, fetchRepoContributors, Contributor } from "../services/TeamSpaceService"
import { fetchAcademicData, deleteAcademicOption, AcademicOption } from "../services/AcademicService"
import { AddAcademicDialog } from "./AddAcademicDialog"

type Step          = "form" | "display-names"
type AddDialogType = "academicYear" | "studyProgram" | null

export default function CreateTeamSpaceModal({ onClose }: { onClose: () => void }) {
  const router            = useRouter()
  const { data: session } = useSession()

  const [step,                setStep]                = useState<Step>("form")
  const [addDialogType,       setAddDialogType]       = useState<AddDialogType>(null)

  const [name,                setName]                = useState("")
  const [description,         setDescription]         = useState("")
  const [selectedRepos,       setSelectedRepos]       = useState<string[]>([])
  const [academicYear,        setAcademicYear]        = useState("")
  const [studyProgram,        setStudyProgram]        = useState("")
  const [projectManager,      setProjectManager]      = useState("")

  const [repoOptions,         setRepoOptions]         = useState<ComboboxOption[]>([])
  const [academicYears,       setAcademicYears]       = useState<AcademicOption[]>([])
  const [studyPrograms,       setStudyPrograms]       = useState<AcademicOption[]>([])
  const [contributors,        setContributors]        = useState<Contributor[]>([])
  const [selectedLogins,      setSelectedLogins]      = useState<Set<string>>(new Set())
  const [displayNames,        setDisplayNames]        = useState<Record<string, string>>({})

  const [loading,             setLoading]             = useState(false)
  const [loadingRepos,        setLoadingRepos]        = useState(true)
  const [loadingAcademic,     setLoadingAcademic]     = useState(true)
  const [loadingContributors, setLoadingContributors] = useState(false)

  useEffect(() => {
    fetchRepos()
      .then(repos => setRepoOptions(repos.map(r => ({
        id:    r.fullName,
        label: r.fullName,
        icon:  r.provider === "gitlab"
          ? <GitLabIcon className="w-3.5 h-3.5 text-[#fc6d26]" />
          : <GitHubIcon className="w-3.5 h-3.5 text-gray-600" />,
      }))))
      .finally(() => setLoadingRepos(false))

    fetchAcademicData()
      .then(data => { setAcademicYears(data.academicYears); setStudyPrograms(data.studyPrograms) })
      .finally(() => setLoadingAcademic(false))
  }, [])

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

  const ownerLogin        = session?.user?.username?.toLowerCase()
  const selectableMembers = contributors.filter(c => c.login.toLowerCase() !== ownerLogin)
  const allSelected       = selectableMembers.length > 0 && selectedLogins.size === selectableMembers.length

  const toggleAll = () => {
    if (allSelected) setSelectedLogins(new Set())
    else setSelectedLogins(new Set(selectableMembers.map(c => c.login)))
  }

  const toggleOne = (login: string) => {
    setSelectedLogins(prev => {
      const next = new Set(prev)
      if (next.has(login)) next.delete(login)
      else next.add(login)
      return next
    })
  }

  const ayOptions: ComboboxOption[] = academicYears.map(ay => ({ id: ay.id, label: ay.label }))
  const spOptions: ComboboxOption[] = studyPrograms.map(sp => ({ id: sp.id, label: sp.label }))

  const handleDeleteAcademic = async (type: "academicYear" | "studyProgram", id: string) => {
    try {
      await deleteAcademicOption(type, id)
      if (type === "academicYear") {
        setAcademicYears(prev => prev.filter(ay => ay.id !== id))
        if (academicYear === id) setAcademicYear("")
      } else {
        setStudyPrograms(prev => prev.filter(sp => sp.id !== id))
        if (studyProgram === id) setStudyProgram("")
      }
    } catch { /* silent */ }
  }

  const handleAcademicAdded = (type: AddDialogType, option: AcademicOption) => {
    if (type === "academicYear") {
      setAcademicYears(prev => [option, ...prev])
      setAcademicYear(option.id)
    } else {
      setStudyPrograms(prev => [...prev, option])
      setStudyProgram(option.id)
    }
    setAddDialogType(null)
  }

  const handleSubmit = async () => {
    if (!name || selectedRepos.length === 0) return
    setLoading(true)
    try {
      const importMembers = Array.from(selectedLogins).map(login => ({
        login,
        displayName: displayNames[login]?.trim() ?? "",
      }))
      const data = await createTeamSpace({
        name,
        description,
        repoFullNames:  selectedRepos,
        academicYearId: academicYear   || null,
        studyProgramId: studyProgram   || null,
        projectManager: projectManager.trim() || null,
        importMembers,
      })
      if (data.id) {
        router.push(`/team-space/${data.id}`)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  const selectedContributors = selectableMembers.filter(c => selectedLogins.has(c.login))

  if (addDialogType) {
    return (
      <AddAcademicDialog
        type={addDialogType}
        open={true}
        onClose={() => setAddDialogType(null)}
        onAdded={option => handleAcademicAdded(addDialogType, option)}
      />
    )
  }

  if (step === "display-names") {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md rounded-2xl [&>button]:hidden">
          <DialogHeader>
            <div className="relative flex items-center justify-center">
              <DialogTitle className="text-xl font-bold text-gray-900">Nama Anggota</DialogTitle>
              <button onClick={onClose} className="absolute right-0 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          <p className="text-sm text-gray-500 mt-1">
            Masukkan nama asli tiap anggota agar mudah dikenali. Boleh dikosongkan.
          </p>

          {selectedContributors.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Tidak ada anggota dipilih</p>
          ) : (
            <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto mt-2">
              {selectedContributors.map((c, idx) => (
                <div
                  key={c.login}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5",
                    idx !== selectedContributors.length - 1 && "border-b border-gray-100"
                  )}
                >
                  <Image src={c.avatar_url} alt={c.login} width={28} height={28} className="rounded-full flex-shrink-0" />
                  <span className="text-xs text-gray-500 w-24 truncate flex-shrink-0">@{c.login}</span>
                  <Input
                    value={displayNames[c.login] ?? ""}
                    onChange={e => setDisplayNames(prev => ({ ...prev, [c.login]: e.target.value }))}
                    placeholder="Nama asli"
                    className="h-8 text-xs rounded-md flex-1 bg-gray-50"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <Button
              className="flex-1 h-10 rounded-lg text-gray-900 font-bold bg-[#CACACA] hover:bg-[#b0b0b0]"
              onClick={() => setStep("form")}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              className="flex-1 h-10 rounded-lg bg-[#00D964] hover:bg-[#00c057] text-gray-900 font-bold"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Membuat..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
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

        <div className="flex flex-col gap-4 mt-2 max-h-[70vh] overflow-y-auto pr-1">
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
            <Label className="text-sm font-medium text-gray-700">Tahun Ajaran</Label>
            <div className="flex gap-2">
              <InfiniteCombobox
                options={ayOptions}
                value={academicYear}
                onChange={v => setAcademicYear(v as string)}
                placeholder={loadingAcademic ? "Memuat..." : "Pilih tahun ajaran"}
                searchPlaceholder="Cari tahun ajaran..."
                emptyMessage="Belum ada data. Tambah dengan tombol +"
                disabled={loadingAcademic}
                onDelete={id => handleDeleteAcademic("academicYear", id)}
                className="flex-1"
              />
              <button
                onClick={() => setAddDialogType("academicYear")}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-input bg-white hover:bg-accent transition-colors flex-shrink-0"
              >
                <Plus className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-gray-700">Program Studi</Label>
            <div className="flex gap-2">
              <InfiniteCombobox
                options={spOptions}
                value={studyProgram}
                onChange={v => setStudyProgram(v as string)}
                placeholder={loadingAcademic ? "Memuat..." : "Pilih program studi"}
                searchPlaceholder="Cari program studi..."
                emptyMessage="Belum ada data. Tambah dengan tombol +"
                disabled={loadingAcademic}
                onDelete={id => handleDeleteAcademic("studyProgram", id)}
                className="flex-1"
              />
              <button
                onClick={() => setAddDialogType("studyProgram")}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-input bg-white hover:bg-accent transition-colors flex-shrink-0"
              >
                <Plus className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-gray-700">Project Manager / Dosen</Label>
            <Input
              value={projectManager}
              onChange={e => setProjectManager(e.target.value)}
              placeholder="Contoh: Dr. Budi Santoso"
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
              <InfiniteCombobox
                options={repoOptions}
                value={selectedRepos}
                onChange={v => setSelectedRepos(v as string[])}
                placeholder="Pilih repository"
                searchPlaceholder="Cari repository..."
                emptyMessage="Repository tidak ditemukan"
                multi
              />
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
                {selectableMembers.length > 0 && (
                  <button onClick={toggleAll} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
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
                  {selectableMembers.map(c => {
                    const selected = selectedLogins.has(c.login)
                    return (
                      <button
                        key={c.login}
                        onClick={() => toggleOne(c.login)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <Image src={c.avatar_url} alt={c.login} width={28} height={28} className="rounded-full flex-shrink-0" />
                        <div className="flex-1 text-left min-w-0">
                          <span className="text-sm text-gray-900 block">@{c.login}</span>
                          {!c.isRegistered && (
                            <span className="text-[10px] text-gray-400">Belum terdaftar di GitPulse</span>
                          )}
                        </div>
                        <div className={cn(
                          "w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors",
                          selected ? "bg-[#00D964] border-[#00D964]" : "border-gray-300"
                        )}>
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
            onClick={() => setStep("display-names")}
            disabled={!name || selectedRepos.length === 0}
          >
            Next
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
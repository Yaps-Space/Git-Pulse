"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input }  from "@/shared/components/ui/input"
import { Label }  from "@/shared/components/ui/label"
import { InfiniteCombobox, ComboboxOption } from "@/shared/components/commons/InfiniteCombobox"
import { updateTeamSpace } from "../../services/TeamSpaceService"
import { fetchAcademicData, AcademicOption } from "../../services/AcademicService"
import { AddAcademicDialog } from "../../components/AddAcademicDialog"
import { TeamSpaceDetail } from "../types/TeamSpaceDetail"
import { toast } from "sonner"
import { useDeleteAcademicConfirm } from "../../components/DeleteAcademicConfrim"

type AddDialogType = "academicYear" | "studyProgram" | null

interface Props {
  detail:  TeamSpaceDetail
  onClose: () => void
  onSaved: (detail: TeamSpaceDetail) => void
}

export function EditTeamSpaceModal({ detail, onClose, onSaved }: Props) {
  const router = useRouter()

  const [addDialogType, setAddDialogType] = useState<AddDialogType>(null)

  const [name,           setName]           = useState(detail.name)
  const [description,    setDescription]    = useState(detail.description ?? "")
  const [academicYear,   setAcademicYear]   = useState(detail.academicYearId ?? "")
  const [studyProgram,   setStudyProgram]   = useState(detail.studyProgramId ?? "")
  const [projectManager, setProjectManager] = useState(detail.projectManager ?? "")

  const [academicYears,   setAcademicYears]   = useState<AcademicOption[]>([])
  const [studyPrograms,   setStudyPrograms]   = useState<AcademicOption[]>([])
  const [loadingAcademic, setLoadingAcademic] = useState(true)
  const [loading,         setLoading]         = useState(false)

  const { requestDelete, DeleteConfirmDialog } = useDeleteAcademicConfirm({
    academicYears, studyPrograms, setAcademicYears, setStudyPrograms,
    academicYear, studyProgram, setAcademicYear, setStudyProgram,
  })

  useEffect(() => {
    fetchAcademicData()
      .then(data => { setAcademicYears(data.academicYears); setStudyPrograms(data.studyPrograms) })
      .finally(() => setLoadingAcademic(false))
  }, [])

  const ayOptions: ComboboxOption[] = academicYears.map(ay => ({ id: ay.id, label: ay.label }))
  const spOptions: ComboboxOption[] = studyPrograms.map(sp => ({ id: sp.id, label: sp.label }))

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
    if (!name.trim()) return
    setLoading(true)
    try {
      await updateTeamSpace(detail.id, {
        name:           name.trim(),
        description:    description.trim() || null,
        projectManager: projectManager.trim() || null,
        academicYearId: academicYear || null,
        studyProgramId: studyProgram || null,
      })
      onSaved({
        ...detail,
        name:           name.trim(),
        description:    description.trim() || null,
        projectManager: projectManager.trim() || null,
        academicYearId: academicYear || null,
        studyProgramId: studyProgram || null,
        academicYear:   academicYears.find(ay => ay.id === academicYear)?.label ?? null,
        studyProgram:   studyPrograms.find(sp => sp.id === studyProgram)?.label ?? null,
      })
      toast.success("Team space berhasil diperbarui.")
      router.refresh()
      onClose()
    } catch {
      toast.error("Gagal memperbarui team space.")
    } finally {
      setLoading(false)
    }
  }

  if (DeleteConfirmDialog) return DeleteConfirmDialog

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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl [&>button]:hidden">
        <DialogHeader>
          <div className="relative flex items-center justify-center">
            <DialogTitle className="text-xl font-bold text-gray-900">Edit Team Space</DialogTitle>
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
                onDelete={id => requestDelete("academicYear", id)}
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
                onDelete={id => requestDelete("studyProgram", id)}
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
        </div>

        <div className="flex gap-3 mt-2">
          <Button
            className="flex-1 h-10 rounded-lg text-gray-900 font-bold bg-[#CACACA] hover:bg-[#b0b0b0]"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-10 rounded-lg bg-[#00D964] hover:bg-[#00c057] text-gray-900 font-bold"
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
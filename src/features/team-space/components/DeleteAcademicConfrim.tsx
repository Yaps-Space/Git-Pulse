"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { deleteAcademicOption, AcademicOption } from "../services/AcademicService"
import { toast } from "sonner"

type AcademicType = "academicYear" | "studyProgram"

interface DeleteConfirm {
  type:  AcademicType
  id:    string
  label: string
}

interface UseDeleteAcademicConfirmParams {
  academicYears:     AcademicOption[]
  studyPrograms:     AcademicOption[]
  setAcademicYears:  React.Dispatch<React.SetStateAction<AcademicOption[]>>
  setStudyPrograms:  React.Dispatch<React.SetStateAction<AcademicOption[]>>
  academicYear:      string
  studyProgram:      string
  setAcademicYear:   (val: string) => void
  setStudyProgram:   (val: string) => void
}

export function useDeleteAcademicConfirm({
  academicYears, studyPrograms, setAcademicYears, setStudyPrograms,
  academicYear, studyProgram, setAcademicYear, setStudyProgram,
}: UseDeleteAcademicConfirmParams) {
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm | null>(null)

  const requestDelete = (type: AcademicType, id: string) => {
    const list  = type === "academicYear" ? academicYears : studyPrograms
    const found = list.find(o => o.id === id)
    if (!found) return
    setDeleteConfirm({ type, id, label: found.label })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    const { type, id } = deleteConfirm
    try {
      await deleteAcademicOption(type, id)
      if (type === "academicYear") {
        setAcademicYears(prev => prev.filter(ay => ay.id !== id))
        if (academicYear === id) setAcademicYear("")
      } else {
        setStudyPrograms(prev => prev.filter(sp => sp.id !== id))
        if (studyProgram === id) setStudyProgram("")
      }
      toast.success(type === "academicYear" ? "Tahun ajaran dihapus." : "Program studi dihapus.")
    } catch {
      toast.error("Gagal menghapus. Coba lagi.")
    } finally {
      setDeleteConfirm(null)
    }
  }

  const DeleteConfirmDialog = !deleteConfirm ? null : (
    <Dialog open onOpenChange={() => setDeleteConfirm(null)}>
      <DialogContent className="max-w-sm rounded-2xl [&>button]:hidden">
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-[#BB230B]" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 text-center">
              {deleteConfirm.type === "academicYear" ? "Hapus Tahun Ajaran" : "Hapus Program Studi"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 text-center">
            Apakah kamu yakin ingin menghapus{" "}
            <span className="font-semibold text-gray-900">{deleteConfirm.label}</span>?
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          <Button
            className="flex-1 h-10 rounded-lg text-gray-900 font-bold bg-[#CACACA] hover:bg-[#b0b0b0]"
            onClick={() => setDeleteConfirm(null)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-10 rounded-lg text-white font-bold bg-[#BB230B] hover:bg-[#A21C06]"
            onClick={confirmDelete}
          >
            Remove
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  return { requestDelete, DeleteConfirmDialog }
}
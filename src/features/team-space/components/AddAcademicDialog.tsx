"use client"

import { useState } from "react"
import { X, Check, ChevronDown } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input }  from "@/shared/components/ui/input"
import { Label }  from "@/shared/components/ui/label"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/shared/components/ui/popover"
import {
  Command, CommandGroup, CommandItem, CommandList,
} from "@/shared/components/ui/command"
import { cn } from "@/shared/lib/utils"
import { addAcademicOption, AcademicOption } from "../services/AcademicService"
import { toast } from "sonner"

interface Props {
  type:    "academicYear" | "studyProgram"
  open:    boolean
  onClose: () => void
  onAdded: (option: AcademicOption) => void
}

const SEMESTERS = ["Gasal", "Genap"]

export function AddAcademicDialog({ type, open, onClose, onAdded }: Props) {
  const [year,         setYear]         = useState("")
  const [semester,     setSemester]     = useState("")
  const [semesterOpen, setSemesterOpen] = useState(false)
  const [label,        setLabel]        = useState("")
  const [loading,      setLoading]      = useState(false)

  const isAcademicYear = type === "academicYear"
  const title          = isAcademicYear ? "Tambah Tahun Ajaran" : "Tambah Program Studi"
  const successMsg     = isAcademicYear ? "Tahun ajaran berhasil ditambahkan." : "Program studi berhasil ditambahkan."

  const handleClose = () => {
    setYear(""); setSemester(""); setLabel("")
    onClose()
  }

  const handleSave = async () => {
    const finalLabel = isAcademicYear ? `${year.trim()} ${semester}` : label.trim()

    if (!finalLabel || (isAcademicYear && (!year.trim() || !semester))) {
      toast.error("Semua field wajib diisi.")
      return
    }

    setLoading(true)
    try {
      const result = await addAcademicOption(type, finalLabel)
      onAdded(result)
      toast.success(successMsg)
      handleClose()
    } catch {
      toast.error("Gagal menyimpan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm rounded-2xl [&>button]:hidden">
        <DialogHeader>
          <div className="relative flex items-center justify-center">
            <DialogTitle className="text-lg font-bold text-gray-900">{title}</DialogTitle>
            <button onClick={handleClose} className="absolute right-0 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {isAcademicYear ? (
            <>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-gray-700">Tahun <span className="text-[#BB230B]">*</span></Label>
                <Input
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  placeholder="Contoh: 2025/2026"
                  className="rounded-lg h-10 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-gray-700">Semester <span className="text-[#BB230B]">*</span></Label>
                <Popover open={semesterOpen} onOpenChange={setSemesterOpen} modal={false}>
                  <PopoverTrigger asChild>
                    <button className={cn(
                      "w-full flex items-center justify-between h-10 px-3 rounded-lg border border-input text-sm transition-colors hover:bg-accent",
                      !semester && "text-muted-foreground"
                    )}>
                      <span>{semester || "Pilih semester"}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {SEMESTERS.map(s => (
                            <CommandItem
                              key={s}
                              value={s}
                              onSelect={() => { setSemester(s); setSemesterOpen(false) }}
                              className="text-sm"
                            >
                              <Check className={cn("mr-2 h-4 w-4", semester === s ? "opacity-100 text-[#00D964]" : "opacity-0")} />
                              {s}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              {year && semester && (
                <p className="text-xs text-gray-400">
                  Preview: <span className="font-medium text-gray-700">{year.trim()} {semester}</span>
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-gray-700">Nama Program Studi <span className="text-[#BB230B]">*</span></Label>
              <Input
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="Contoh: Teknik Informatika"
                className="rounded-lg h-10 text-sm"
                onKeyDown={e => e.key === "Enter" && handleSave()}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-2">
          <Button
            className="flex-1 h-10 rounded-lg text-gray-900 font-bold bg-[#CACACA] hover:bg-[#b0b0b0]"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-10 rounded-lg bg-[#00D964] hover:bg-[#00c057] text-gray-900 font-bold"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
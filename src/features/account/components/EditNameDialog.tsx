"use client"

import { Loader2, X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"

interface Props {
  open:      boolean
  value:     string
  saving:    boolean
  onChange:  (val: string) => void
  onSave:    () => void
  onClose:   () => void
}

export function EditNameDialog({ open, value, saving, onChange, onSave, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl [&>button]:hidden">
        <DialogHeader>
          <div className="relative flex items-center justify-center">
            <DialogTitle className="text-lg font-bold text-gray-900">Edit Nama</DialogTitle>
            <button onClick={onClose} className="absolute right-0 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-sm font-medium text-gray-700">
            Nama <span className="text-[#BB230B]">*</span>
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onSave() }}
            placeholder="Masukkan nama baru"
            autoFocus
            className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-3 h-10 outline-none focus:border-[#00d964] transition-colors"
          />
        </div>

        <div className="flex gap-3 mt-2">
          <Button
            className="flex-1 h-10 rounded-lg text-gray-900 font-bold bg-[#CACACA] hover:bg-[#b0b0b0]"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-10 rounded-lg bg-[#00D964] hover:bg-[#00c057] text-gray-900 font-bold"
            onClick={onSave}
            disabled={saving}
          >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
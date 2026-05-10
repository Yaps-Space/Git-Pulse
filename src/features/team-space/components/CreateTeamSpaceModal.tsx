"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { createTeamSpace, fetchRepos } from "../services/TeamSpaceService"

interface Repo {
  id:       string;
  fullName: string;
}

export default function CreateTeamSpaceModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [name,         setName]         = useState("")
  const [description,  setDescription]  = useState("")
  const [repoFullName, setRepoFullName] = useState("")
  const [repos,        setRepos]        = useState<Repo[]>([])
  const [loading,      setLoading]      = useState(false)
  const [loadingRepos, setLoadingRepos] = useState(true)

  useEffect(() => {
    fetchRepos()
      .then(setRepos)
      .finally(() => setLoadingRepos(false))
  }, [])

  const handleSubmit = async () => {
    if (!name || !repoFullName) return
    setLoading(true)
    try {
      const data = await createTeamSpace({ name, description, repoFullName })
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
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900">Create Team Space</DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
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
              className="rounded-xl h-11"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-gray-700">Deskripsi</Label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Contoh: Tim Kajja dibentuk untuk mengerjakan projek."
              className="rounded-xl h-11"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-gray-700">Repository</Label>
            {loadingRepos ? (
              <p className="text-sm text-gray-400">Memuat repo...</p>
            ) : (
              <Select value={repoFullName} onValueChange={setRepoFullName}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Pilih repository" />
                </SelectTrigger>
                <SelectContent>
                  {repos.map((r) => (
                    <SelectItem key={r.id} value={r.fullName}>{r.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-gray-400">Hanya repo yang sudah diconnect di Dashboard</p>
          </div>
        </div>

        <div className="flex gap-3 mt-2">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl text-gray-600 font-bold"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-11 rounded-xl bg-[#00D964] hover:bg-[#00c057] text-gray-900 font-bold"
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
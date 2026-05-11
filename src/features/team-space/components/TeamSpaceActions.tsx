"use client"

import { useState } from "react"
import { Search, UserPlus, Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import CreateTeamSpaceModal from "./CreateTeamSpaceModal"
import JoinTeamSpaceModal from "./JoinTeamSpaceModal"
import { cn } from "@/shared/lib/utils"

interface TeamSpaceSearchActionsProps {
  value:    string;
  onChange: (value: string) => void;
}

export default function TeamSpaceSearchActions({ value, onChange }: TeamSpaceSearchActionsProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin,   setShowJoin]   = useState(false)

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Cari team space..."
            className="pl-9 h-10 bg-white border-gray-200 text-sm"
          />
        </div>

        <Button
          variant="outline"
          className={cn(
            "h-10 w-28 gap-2 border-gray-200 transition-colors",
            showJoin
              ? "bg-[#00D964] text-gray-900 border-[#00D964]"
              : "bg-white text-gray-700 hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964]"
          )}
          onClick={() => setShowJoin(true)}
        >
          <UserPlus className="w-4 h-4" />
          Join
        </Button>

        <Button
          variant="outline"
          className={cn(
            "h-10 w-28 gap-2 border-gray-200 transition-colors",
            showCreate
              ? "bg-[#00D964] text-gray-900 border-[#00D964]"
              : "bg-white text-gray-700 hover:bg-[#00D964] hover:text-gray-900 hover:border-[#00D964]"
          )}
          onClick={() => setShowCreate(true)}
        >
          <Plus className="w-4 h-4" />
          Create
        </Button>
      </div>

      {showCreate && <CreateTeamSpaceModal onClose={() => setShowCreate(false)} />}
      {showJoin   && <JoinTeamSpaceModal   onClose={() => setShowJoin(false)}   />}
    </>
  )
}
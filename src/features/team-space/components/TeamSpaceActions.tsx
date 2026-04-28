"use client"

import { useState } from "react"
import { UserPlus, Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import CreateTeamSpaceModal from "./CreateTeamSpaceModal"
import JoinTeamSpaceModal from "./JoinTeamSpaceModal"

export default function TeamSpaceActions() {
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin,   setShowJoin]   = useState(false)

  return (
    <>
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setShowJoin(true)}
        >
          <UserPlus className="w-4 h-4" />
          Gabung
        </Button>
        <Button
          className="gap-2 text-white"
          style={{ background: "#6265FE" }}
          onClick={() => setShowCreate(true)}
        >
          <Plus className="w-4 h-4" />
          Buat Team Space
        </Button>
      </div>

      {showCreate && <CreateTeamSpaceModal onClose={() => setShowCreate(false)} />}
      {showJoin   && <JoinTeamSpaceModal   onClose={() => setShowJoin(false)}   />}
    </>
  )
}
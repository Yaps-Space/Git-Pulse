"use client"
import { useState } from "react"
import CreateTeamSpaceModal from "@/components/team-space/CreateTeamSpaceModal"
import JoinTeamSpaceModal from "@/components/team-space/JoinTeamSpaceModal"

export default function TeamSpaceActions() {
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin,   setShowJoin]   = useState(false)

  return (
    <>
      <div className="flex gap-3">
        <button onClick={() => setShowJoin(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: "#F4F6F9", color: "#555" }}>
          Gabung Team Space
        </button>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "#2E86C1" }}>
          + Buat Team Space
        </button>
      </div>

      {showCreate && <CreateTeamSpaceModal onClose={() => setShowCreate(false)} />}
      {showJoin   && <JoinTeamSpaceModal   onClose={() => setShowJoin(false)}   />}
    </>
  )
}
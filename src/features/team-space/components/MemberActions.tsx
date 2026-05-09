"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  memberId:     string
  memberRole:   string
  memberUserId: string
  myRole:       string
  ownerId:      string
  classId:      string
}

export default function MemberActions({ memberId, memberRole, memberUserId, myRole, ownerId, classId }: Props) {
  const router  = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  if (memberUserId === ownerId) {
    return <span className="text-xs" style={{ color: "#aaa" }}>Owner</span>
  }

  const action = async (type: "promote" | "demote" | "kick") => {
    setLoading(type)
    try {
      await fetch(`/api/team-space/${classId}/member/${memberId}/${type}`, { method: "POST" })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2">
      {myRole === "owner" && memberRole === "evaluator" && (
        <button onClick={() => action("demote")} disabled={loading === "demote"}
          className="text-xs px-2 py-1 rounded-lg transition-opacity hover:opacity-80"
          style={{ background: "#FFF3E0", color: "#F0883E" }}>
          {loading === "demote" ? "..." : "Demote"}
        </button>
      )}
      {(myRole === "owner" || myRole === "evaluator") && memberRole === "contributor" && (
        <button onClick={() => action("promote")} disabled={loading === "promote"}
          className="text-xs px-2 py-1 rounded-lg transition-opacity hover:opacity-80"
          style={{ background: "#EBF5FB", color: "#2E86C1" }}>
          {loading === "promote" ? "..." : "Promote"}
        </button>
      )}
      {(myRole === "owner" || myRole === "evaluator") && (
        <button onClick={() => action("kick")} disabled={loading === "kick"}
          className="text-xs px-2 py-1 rounded-lg transition-opacity hover:opacity-80"
          style={{ background: "#FFF0F0", color: "#F85149" }}>
          {loading === "kick" ? "..." : "Kick"}
        </button>
      )}
    </div>
  )
}
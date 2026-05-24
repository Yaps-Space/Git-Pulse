"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  memberId:     string;
  memberRole:   string;
  memberUserId: string;
  myRole:       string;
  ownerId:      string;
  classId:      string;
}

type ActionType = "promote" | "demote" | "kick"

export default function MemberActions({ memberId, memberRole, memberUserId, myRole, ownerId, classId }: Props) {
  const router              = useRouter()
  const [loading, setLoading] = useState<ActionType | null>(null)

  if (memberUserId === ownerId) {
    return <span className="text-xs text-gray-400">Owner</span>
  }

  const action = async (type: ActionType) => {
    setLoading(type)
    try {
      await fetch(`/api/team-space/${classId}/member/${memberId}/${type}`, { method: "POST" })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  const ACTION_CONFIG: { type: ActionType; label: string; bg: string; color: string; show: boolean }[] = [
    {
      type:  "demote",
      label: "Demote",
      bg:    "#FFF3E0",
      color: "#F0883E",
      show:  myRole === "owner" && memberRole === "evaluator",
    },
    {
      type:  "promote",
      label: "Promote",
      bg:    "#EBF5FB",
      color: "#2E86C1",
      show:  (myRole === "owner" || myRole === "evaluator") && memberRole === "contributor",
    },
    {
      type:  "kick",
      label: "Kick",
      bg:    "#FFF0F0",
      color: "#F85149",
      show:  myRole === "owner" || myRole === "evaluator",
    },
  ]

  return (
    <div className="flex gap-2">
      {ACTION_CONFIG.filter(a => a.show).map(({ type, label, bg, color }) => (
        <button
          key={type}
          onClick={() => action(type)}
          disabled={loading === type}
          className="text-xs px-2 py-1 rounded-lg transition-opacity hover:opacity-80"
          style={{ background: bg, color, opacity: loading === type ? 0.6 : 1 }}
        >
          {loading === type ? "..." : label}
        </button>
      ))}
    </div>
  )
}
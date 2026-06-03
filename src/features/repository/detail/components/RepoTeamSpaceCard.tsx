"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"

interface TeamSpace {
  id:   string
  name: string
  role: string
}

interface Props {
  repoFullName: string
}

export function RepoTeamSpaceCard({ repoFullName }: Props) {
  const router                        = useRouter()
  const [teamSpaces, setTeamSpaces]   = useState<TeamSpace[]>([])
  const [loading,    setLoading]      = useState(true)

  useEffect(() => {
    fetch("/api/team-space")
      .then(r => r.json())
      .then(data => {
        const matched = (data as { id: string; name: string; role: string; repoName: string }[])
          .filter(t => t.repoName === repoFullName)
        setTeamSpaces(matched)
      })
      .finally(() => setLoading(false))
  }, [repoFullName])

  if (loading) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Users className="w-4 h-4 text-gray-500" />
        <CardTitle className="text-base font-bold">Team Space</CardTitle>
      </CardHeader>
      <CardContent>
        {teamSpaces.length === 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">
              Belum ada Team Space yang terhubung dengan repository ini.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-9 text-sm border-gray-200 hover:bg-[#00D964] hover:border-[#00D964] hover:text-gray-900 transition-colors"
                onClick={() => router.push("/team-space")}
              >
                Join Team Space
              </Button>
              <Button
                className="flex-1 h-9 text-sm bg-[#00D964] hover:bg-[#00c057] text-gray-900"
                onClick={() => router.push("/team-space")}
              >
                Create Team Space
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {teamSpaces.map(ts => (
              <button
                key={ts.id}
                onClick={() => router.push(`/team-space/${ts.id}`)}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{ts.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{ts.role}</p>
                </div>
                <span className="text-xs text-[#00D964] font-medium">Buka →</span>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
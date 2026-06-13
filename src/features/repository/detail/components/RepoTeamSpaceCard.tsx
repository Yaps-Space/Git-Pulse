"use client"

import { useRouter } from "next/navigation"
import { Users, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL } from "@/features/team-space/constants/TeamSpaceConfig"
import { useRepoTeamSpaces } from "../hooks/useRepoTeamSpaces"

interface Props {
  repoFullName: string
}

export function RepoTeamSpaceCard({ repoFullName }: Props) {
  const router               = useRouter()
  const { teamSpaces }       = useRepoTeamSpaces(repoFullName)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <CardTitle className="text-base font-bold">Team Space</CardTitle>
      </CardHeader>
      <CardContent>
        {teamSpaces.length === 0 ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-gray-700">Belum ada Team Space</p>
              <p className="text-xs text-gray-400">
                Repository ini belum terhubung dengan Team Space manapun. Bergabung atau buat tim baru untuk berkolaborasi.
              </p>
            </div>
            <Button
              className="w-full h-10 text-sm bg-[#00D964] hover:bg-[#00c057] text-gray-900 font-semibold"
              onClick={() => router.push("/team-space")}
            >
              Kelola Team Space
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {teamSpaces.map(ts => (
              <button
                key={ts.id}
                onClick={() => router.push(`/team-space/${ts.id}`)}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left w-full"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00D964]/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-[#00D964]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{ts.name}</p>
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: ROLE_COLOR[ts.role] ?? "#eee",
                        color:      ROLE_TEXT[ts.role]  ?? "#333",
                      }}
                    >
                      {ROLE_LABEL[ts.role] ?? ts.role}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
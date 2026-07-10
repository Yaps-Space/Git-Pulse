"use client"

import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL } from "@/features/team-space/constants/TeamSpaceConfig"
import { useRepoTeamSpaces } from "../hooks/useRepoTeamSpaces"

interface Props {
  repoFullName: string
}

export function RepoTeamSpaceCard({ repoFullName }: Props) {
  const router         = useRouter()
  const { teamSpaces } = useRepoTeamSpaces(repoFullName)

  return (
    <Card>
      <CardHeader>
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
          <div className="flex flex-col gap-1.5">
            {teamSpaces.map(ts => (
              <button
                key={ts.id}
                onClick={() => router.push(`/team-space/${ts.id}`)}
                className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-left w-full gap-2"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-1 self-stretch rounded-full bg-[#00D964] flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{ts.name}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[160px]">
                      {ts.description ?? "Tidak ada deskripsi"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <span
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: ROLE_COLOR[ts.role] ?? "#eee", color: ROLE_TEXT[ts.role] ?? "#333" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ROLE_TEXT[ts.role] ?? "#333" }} />
                    {ROLE_LABEL[ts.role] ?? ts.role}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
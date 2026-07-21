"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useIsMobile }   from "@/shared/hooks/UseMobile"
import { PageShell }     from "@/shared/components/commons/PageShell"
import { PageSkeleton }  from "@/shared/components/commons/PageSkeleton"
import { RepoDetailView }    from "./RepoDetailView"
import { RepoDetailMobile }  from "./RepoDetailMobile"
import { useRepoDetail }     from "../hooks/useRepoDetail"
import { GitHubIcon, GitLabIcon } from "@/shared/components/commons/ProviderIcons"

interface Props {
  id: string
}

export function RepoDetailLayout({ id }: Props) {
  const { repo, loading } = useRepoDetail(id)
  const router            = useRouter()
  const isMobile          = useIsMobile()
  const searchParams      = useSearchParams()

  const teamSpaceId   = searchParams.get("teamSpaceId")
  const teamSpaceName = searchParams.get("teamSpaceName")
  const fromTeamSpace = Boolean(teamSpaceId && teamSpaceName)

  useEffect(() => {
    if (!loading && !repo) router.push("/repository")
  }, [loading, repo, router])

  if (loading) return <PageSkeleton />
  if (!repo)   return null

  const backHref = fromTeamSpace ? "/team-space" : "/repository"

  const detailContent = (
    <span className="flex items-center gap-1.5">
      {repo.provider === "gitlab" ? (
        <GitLabIcon className="w-4 h-4 text-[#fc6d26] flex-shrink-0" />
      ) : (
        <GitHubIcon className="w-4 h-4 text-gray-900 flex-shrink-0" />
      )}
      {repo.fullName}
    </span>
  )

  if (isMobile) return (
    <RepoDetailMobile
      repo={repo}
      backHref={fromTeamSpace ? `/team-space/${teamSpaceId}` : "/repository"}
      teamSpaceId={teamSpaceId ?? undefined}
    />
  )

  return (
    <PageShell
      title={fromTeamSpace ? "Team Space" : "Repository"}
      middle={
        fromTeamSpace ? (
          <Link href={`/team-space/${teamSpaceId}`} className="hover:underline">
            {teamSpaceName}
          </Link>
        ) : undefined
      }
      detail={detailContent}
      backHref={backHref}
    >
      <RepoDetailView repo={repo} teamSpaceId={teamSpaceId ?? undefined} />
    </PageShell>
  )
}
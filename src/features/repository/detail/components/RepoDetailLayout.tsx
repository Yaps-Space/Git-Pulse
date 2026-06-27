"use client"

import { useRouter } from "next/navigation"
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

  useEffect(() => {
    if (!loading && !repo) router.push("/repository")
  }, [loading, repo, router])

  if (loading) return <PageSkeleton />
  if (!repo)   return null

  if (isMobile) return <RepoDetailMobile repo={repo} />

  return (
    <PageShell
      title="Repository"
      detail={
        <span className="flex items-center gap-1.5">
          {repo.provider === "gitlab" ? (
            <GitLabIcon className="w-4 h-4 text-[#fc6d26] flex-shrink-0" />
          ) : (
            <GitHubIcon className="w-4 h-4 text-gray-900 flex-shrink-0" />
          )}
          {repo.fullName}
        </span>
      }
      backHref="/repository"
    >
      <RepoDetailView repo={repo} />
    </PageShell>
  )
}
"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { PageShell } from "@/shared/components/commons/PageShell"
import { PageSkeleton } from "@/shared/components/commons/PageSkeleton"
import { RepoDetailView } from "./RepoDetailView"
import { useRepoDetail } from "../hooks/useRepoDetail"

interface Props {
  id: string
}

export function RepoDetailLayout({ id }: Props) {
  const { repo, loading } = useRepoDetail(id)
  const router            = useRouter()

  useEffect(() => {
    if (!loading && !repo) router.push("/repository")
  }, [loading, repo, router])

  if (loading) return <PageSkeleton />
  if (!repo)   return null

  return (
    <PageShell title="Repository" detail={repo.fullName}>
      <RepoDetailView repo={repo} />
    </PageShell>
  )
}
"use client"

import { useState } from "react"
import { useIsMobile }   from "@/shared/hooks/UseMobile"
import { PageShell }     from "@/shared/components/commons/PageShell"
import { PageSkeleton }  from "@/shared/components/commons/PageSkeleton"
import { RepoActions }   from "./RepoActions"
import { RepoTable }     from "./RepoTable"
import { RepositoryMobile } from "./RepositoryMobile"
import { useRepos }      from "../hooks/useRepos"

export function RepositoryLayout() {
  const isMobile                = useIsMobile()
  const { repos, loading }      = useRepos()
  const [search,   setSearch]   = useState("")
  const [pageSize, setPageSize] = useState(10)

  if (loading) return <PageSkeleton />

  if (isMobile) return <RepositoryMobile repos={repos} />

  return (
    <PageShell title="Repository">
      <RepoActions
        value={search}
        pageSize={pageSize}
        onSearch={setSearch}
        onPageSize={setPageSize}
      />
      <RepoTable
        repos={repos}
        search={search}
        pageSize={pageSize}
      />
    </PageShell>
  )
}
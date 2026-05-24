"use client"

import { useState } from "react"
import { PageShell } from "@/shared/components/commons/PageShell"
import { PageSkeleton } from "@/shared/components/commons/PageSkeleton"
import { RepoActions } from "./RepoActions"
import { RepoTable } from "./RepoTable"
import { useRepos } from "../hooks/useRepos"

export function RepositoryLayout() {
  const { repos, loading }      = useRepos()
  const [search,   setSearch]   = useState("")
  const [pageSize, setPageSize] = useState(10)

  if (loading) return <PageSkeleton />

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
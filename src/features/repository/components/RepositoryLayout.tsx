"use client"

import { useState } from "react"
import { PageShell } from "@/shared/components/commons/PageShell"
import { RepoActions } from "./RepoActions"
import { RepoTable } from "./RepoTable"
import { Repo } from "../types"

interface Props {
  repos: Repo[]
}

export function RepositoryLayout({ repos }: Props) {
  const [search,   setSearch]   = useState("")
  const [pageSize, setPageSize] = useState(10)

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
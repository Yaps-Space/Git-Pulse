"use client"

import { useState } from "react"
import { useIsMobile }      from "@/shared/hooks/UseMobile"
import { PageShell }        from "@/shared/components/commons/PageShell"
import { PageSkeleton }     from "@/shared/components/commons/PageSkeleton"
import { RepoActions }      from "./RepoActions"
import { RepoTable }        from "./RepoTable"
import { RepositoryMobile } from "./RepositoryMobile"
import { useRepos }         from "../hooks/useRepos"
import { Repo }             from "../types"

export type FilterState = {
  provider:     "" | "github" | "gitlab"
  productivity: string
  grade:        string
}

function applyFilters(repos: Repo[], filters: FilterState): Repo[] {
  return repos.filter(r => {
    if (filters.provider     && r.provider !== filters.provider)                            return false
    if (filters.productivity && r.productivityState.toLowerCase() !== filters.productivity) return false
    if (filters.grade        && r.healthGrade !== filters.grade)                            return false
    return true
  })
}

export function RepositoryLayout() {
  const isMobile           = useIsMobile()
  const { repos, loading } = useRepos()

  const [search,   setSearch]   = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [filters,  setFilters]  = useState<FilterState>({ provider: "", productivity: "", grade: "" })

  if (loading) return <PageSkeleton />

  const filteredRepos = applyFilters(repos, filters)

  if (isMobile) return (
    <RepositoryMobile
      repos   ={filteredRepos}
      filters ={filters}
      onFilter={setFilters}
    />
  )

  return (
    <PageShell title="Repository">
      <RepoActions
        value     ={search}
        pageSize  ={pageSize}
        filters   ={filters}
        onSearch  ={setSearch}
        onPageSize={setPageSize}
        onFilter  ={setFilters}
      />
      <RepoTable
        repos    ={filteredRepos}
        search   ={search}
        pageSize ={pageSize}
      />
    </PageShell>
  )
}
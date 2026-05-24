"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AlertCircle, X } from "lucide-react"
import { useIsMobile } from "@/shared/hooks/UseMobile"
import { PageShell } from "@/shared/components/commons/PageShell"
import { PageSkeleton } from "@/shared/components/commons/PageSkeleton"
import { ConnectSearchActions } from "./ConnectSearchActions"
import { ConnectRepoList } from "./ConnectRepoList"
import { ConnectMobile } from "./ConnectMobile"
import { useConnectedRepos } from "../hooks/useConnectedRepos"
import { GithubRepo } from "../types"
import { fetchGithubRepos } from "../services"
import { analyzeRepo } from "../../detail/services/repoService"

export function ConnectRepoPage() {
  const { data: session }                                 = useSession()
  const router                                            = useRouter()
  const isMobile                                          = useIsMobile()
  const { connectedFullNames, refresh: refreshConnected } = useConnectedRepos()

  const connectedSet = new Set(connectedFullNames)

  const [repos,      setRepos]      = useState<GithubRepo[]>([])
  const [loading,    setLoading]    = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [search,     setSearch]     = useState("")
  const [filter,     setFilter]     = useState("all")
  const [error,      setError]      = useState("")
  const [pageSize,   setPageSize]   = useState(10)
  const [page,       setPage]       = useState(1)

  const loadRepos = useCallback(async () => {
    if (!session?.accessToken) return
    setLoading(true)
    try {
      let allRepos: GithubRepo[] = []
      let currentPage            = 1
      while (true) {
        const data  = await fetchGithubRepos(currentPage, filter)
        const batch = data.repos ?? []
        allRepos    = [...allRepos, ...batch]
        if (batch.length < 20) break
        currentPage++
      }
      setRepos(allRepos)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [session?.accessToken, filter])

  useEffect(() => {
    setPage(1)
    loadRepos()
  }, [filter, loadRepos])

  const unconnected = repos.filter(r => !connectedSet.has(r.full_name))
  const filtered    = unconnected.filter(r =>
    r.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description ?? "").toLowerCase().includes(search.toLowerCase())
  )
  const totalPages  = Math.ceil(filtered.length / pageSize)
  const paginated   = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSearch   = (val: string) => { setSearch(val);   setPage(1) }
  const handlePageSize = (val: number) => { setPageSize(val); setPage(1) }
  const handleFilter   = (val: string) => { setFilter(val);   setPage(1) }

  const handleConnect = async (repo: GithubRepo) => {
    setConnecting(repo.full_name)
    setError("")
    try {
      const result = await analyzeRepo(repo.full_name)
      if (result.success) {
        router.push("/repository")
      } else {
        setError(result.error ?? "Gagal menganalisis repository")
      }
    } catch {
      setError("Gagal terhubung ke server. Pastikan ML Service sudah berjalan.")
    } finally {
      setConnecting(null)
      refreshConnected()
    }
  }

  if (loading) return <PageSkeleton />

  if (isMobile) return (
    <ConnectMobile
      search={search}
      filter={filter}
      pageSize={pageSize}
      page={page}
      totalPages={totalPages}
      paginated={paginated}
      connecting={connecting}
      error={error}
      onSearch={handleSearch}
      onFilter={handleFilter}
      onPageSize={handlePageSize}
      onPageChange={setPage}
      onConnect={handleConnect}
      onDismissError={() => setError("")}
    />
  )

  return (
    <PageShell title="Repository" detail="Connect Repository">
      <div className="flex flex-col gap-4">
        <ConnectSearchActions
          search={search}
          pageSize={pageSize}
          filter={filter}
          onSearch={handleSearch}
          onPageSize={handlePageSize}
          onFilter={handleFilter}
        />

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-500 flex-1">{error}</p>
            <button onClick={() => setError("")}>
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl overflow-hidden">
          <ConnectRepoList
            paginated={paginated}
            page={page}
            totalPages={totalPages}
            connecting={connecting}
            onConnect={handleConnect}
            onPageChange={setPage}
          />
        </div>
      </div>
    </PageShell>
  )
}
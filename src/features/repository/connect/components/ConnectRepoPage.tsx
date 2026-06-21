"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount }    from "@/features/account/hooks/UseAccount"
import { useRouter }     from "next/navigation"
import { AlertCircle, X, Github, RefreshCw } from "lucide-react"
import { useIsMobile }   from "@/shared/hooks/UseMobile"
import { PageShell }     from "@/shared/components/commons/PageShell"
import { PageSkeleton }  from "@/shared/components/commons/PageSkeleton"
import { Button }        from "@/shared/components/ui/button"
import { ConnectSearchActions } from "./ConnectSearchActions"
import { ConnectRepoList }      from "./ConnectRepoList"
import { ConnectMobile }        from "./ConnectMobile"

import { ConnectRepoSkeleton } from "./ConnectRepoSkeleton"
import { useConnectedRepos }    from "../hooks/useConnectedRepos"
import { Provider, GithubRepo } from "@/features/repository/types"
import { fetchProviderRepos }   from "../services"
import { analyzeRepo }          from "../../detail/services/repoService"

function GitLabIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51 1.22 3.78a.84.84 0 0 1-.3.92z"/>
    </svg>
  )
}

type FetchState = "idle" | "loading" | "no_token" | "expired" | "empty" | "ok"

export function ConnectRepoPage() {
  const { account }                                       = useAccount()
  const router                                            = useRouter()
  const isMobile                                          = useIsMobile()
  const { connectedFullNames, refresh: refreshConnected } = useConnectedRepos()
  const connectedSet = new Set(connectedFullNames)

  const [repos,      setRepos]      = useState<GithubRepo[]>([])
  const [fetchState, setFetchState] = useState<FetchState>("idle")
  const [connecting, setConnecting] = useState<string | null>(null)
  const [search,     setSearch]     = useState("")
  const [filter,     setFilter]     = useState("all")
  const [provider,   setProvider]   = useState<Provider>("github")
  const [error,      setError]      = useState("")
  const [pageSize,   setPageSize]   = useState(10)
  const [page,       setPage]       = useState(1)
  const [successMsg, setSuccessMsg] = useState("")

  // Cek provider mana yang sudah connect dari Firestore lewat /api/account
  const githubConnected = !!account?.linkedProviders?.github?.accessToken
  const gitlabConnected = !!account?.linkedProviders?.gitlab?.accessToken
  const noneConnected   = !githubConnected && !gitlabConnected

  const loadRepos = useCallback(async () => {
    setFetchState("loading")
    setRepos([])

    try {
      let allRepos: GithubRepo[] = []
      let currentPage            = 1

      while (true) {
        const res  = await fetch(`/api/repo?page=${currentPage}&filter=${filter}&provider=${provider}`)
        const data = await res.json()

        if (res.status === 401) {
          // Bedain no_token vs expired
          setFetchState(data.error === "No GitHub token" || data.error === "No GitLab token"
            ? "no_token"
            : "expired"
          )
          return
        }

        if (!res.ok) {
          setFetchState("expired")
          return
        }

        const batch = data.repos ?? []
        allRepos    = [...allRepos, ...batch]
        if (batch.length < 20) break
        currentPage++
      }

      setRepos(allRepos)
      setFetchState(allRepos.length === 0 ? "empty" : "ok")
    } catch {
      setFetchState("expired")
    }
  }, [filter, provider])

  useEffect(() => {
    setPage(1)
    loadRepos()
  }, [filter, loadRepos])

  const unconnected = repos.filter(r => !connectedSet.has(r.full_name))
  const filtered    = unconnected.filter(r =>
    r.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description ?? "").toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSearch   = (val: string) => { setSearch(val);   setPage(1) }
  const handlePageSize = (val: number) => { setPageSize(val); setPage(1) }
  const handleFilter   = (val: string) => { setFilter(val);   setPage(1) }
  const handleProvider = (p: Provider) => { setProvider(p);   setPage(1) }

  const handleConnect = async (repo: GithubRepo) => {
    setConnecting(repo.full_name)
    setError("")
    try {
      const result = await analyzeRepo(repo.full_name, { provider, repoId: repo.id })
      if (result.success) {
        setSuccessMsg(`${repo.full_name} berhasil ditambahkan!`)
        refreshConnected()
        setTimeout(() => router.push("/repository"), 1500)
      } else {
        setError(result.error ?? "Gagal menganalisis repository")
      }
    } catch {
      setError("Gagal terhubung ke server. Pastikan ML Service sudah berjalan.")
    } finally {
      setConnecting(null)
    }
  }

  // ── State: belum connect provider sama sekali ──────────────
  if (noneConnected) {
    return (
      <PageShell title="Repository" detail="Connect Repository">
        <div className="bg-white rounded-2xl p-12 flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
            <Github className="w-8 h-8 text-gray-300" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg mb-1">Belum ada provider terhubung</p>
            <p className="text-sm text-gray-400 max-w-sm">
              Hubungkan akun GitHub atau GitLab kamu terlebih dahulu untuk bisa browse dan connect repository.
            </p>
          </div>
          <div className="flex gap-3">
            <a href="/api/auth/connect/github/init">
              <Button className="gap-2 font-medium text-gray-900 border-0" style={{ background: "#00d964" }}>
                <Github className="w-4 h-4" />
                Connect GitHub
              </Button>
            </a>
            <a href="/api/auth/connect/gitlab/init">
              <Button variant="outline" className="gap-2 font-medium text-gray-700 border-gray-200">
                <GitLabIcon className="w-4 h-4 text-[#fc6d26]" />
                Connect GitLab
              </Button>
            </a>
          </div>
        </div>
      </PageShell>
    )
  }

  if (isMobile) return (
    <ConnectMobile
      search={search}
      filter={filter}
      pageSize={pageSize}
      page={page}
      totalPages={totalPages}
      paginated={paginated}
      connecting={connecting}
      fetchState={fetchState}
      error={error}
      successMsg={successMsg}
      provider={provider}
      githubConnected={githubConnected}
      gitlabConnected={gitlabConnected}
      onSearch={handleSearch}
      onFilter={handleFilter}
      onPageSize={handlePageSize}
      onPageChange={setPage}
      onConnect={handleConnect}
      onDismissError={() => setError("")}
      onProvider={handleProvider}
    />
  )

  return (
    <PageShell title="Repository" detail="Connect Repository">
      <div className="flex flex-col gap-4">
        <ConnectSearchActions
          search={search}
          pageSize={pageSize}
          filter={filter}
          provider={provider}
          githubConnected={githubConnected}
          gitlabConnected={gitlabConnected}
          onProvider={handleProvider}
          onSearch={handleSearch}
          onPageSize={handlePageSize}
          onFilter={handleFilter}
        />

        {/* Toast sukses */}
        {successMsg && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
            <p className="text-sm text-green-700 flex-1 font-medium">{successMsg}</p>
            <p className="text-xs text-green-500">Mengalihkan...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-500 flex-1">{error}</p>
            <button onClick={() => setError("")}>
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}

        {/* Token expired / error fetch */}
        {fetchState === "expired" && (
          <div className="bg-white rounded-xl px-6 py-5 flex items-center justify-between border border-amber-100">
            <div>
              <p className="font-medium text-gray-800 text-sm">
                Sesi {provider === "github" ? "GitHub" : "GitLab"} kamu sudah habis
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Hubungkan ulang untuk melanjutkan</p>
            </div>
            <a href={`/api/auth/connect/${provider}/init`}>
              <Button size="sm" variant="outline" className="gap-2 text-xs">
                <RefreshCw className="w-3.5 h-3.5" />
                Hubungkan Ulang
              </Button>
            </a>
          </div>
        )}

        {/* Loading skeleton */}
        {fetchState === "loading" && <ConnectRepoSkeleton />}

        {/* Empty state */}
        {fetchState === "empty" && (
          <div className="bg-white rounded-xl flex flex-col items-center justify-center py-16 gap-2">
            <p className="font-medium text-gray-700">
              Tidak ada repository di akun {provider === "github" ? "GitHub" : "GitLab"} kamu
            </p>
            <p className="text-sm text-gray-400">Coba ganti filter atau provider</p>
          </div>
        )}

        {/* List normal */}
        {fetchState === "ok" && (
          <div className="bg-white rounded-xl overflow-hidden">
            <ConnectRepoList
              paginated={paginated}
              page={page}
              totalPages={totalPages}
              connecting={connecting}
              provider={provider}
              onConnect={handleConnect}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </PageShell>
  )
}
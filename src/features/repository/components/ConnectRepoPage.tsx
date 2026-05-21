"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Star, GitFork, Clock, AlertCircle, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/shared/components/ui/button"
import { PageSkeleton } from "@/shared/components/commons/PageSkeleton"
import { Pagination } from "@/shared/components/commons/Pagination"
import { ConnectSearchActions } from "./ConnectSearchActions"
import { GithubRepo } from "../types"
import { analyzeRepo, fetchGithubRepos } from "../services/repoService"
import { timeAgo } from "../helpers"

interface Props {
  connectedFullNames?: string[]
}

export function ConnectRepoPage({ connectedFullNames = [] }: Props) {
  const { data: session } = useSession()
  const router            = useRouter()

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
      const data = await fetchGithubRepos(1, filter)
      setRepos(data.repos ?? [])
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

  const filtered   = unconnected.filter(r =>
    r.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description ?? "").toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize)

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
    }
  }

  if (loading) return <PageSkeleton />

  return (
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

      <div className="bg-white rounded-2xl overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="font-medium text-gray-700">Tidak ada repository ditemukan</p>
          </div>
        ) : (
          <>
            {paginated.map(repo => (
              <div
                key={repo.id}
                className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Image
                    src={repo.owner.avatar_url}
                    alt={repo.owner.login}
                    width={36}
                    height={36}
                    className="rounded-full flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm text-gray-800">{repo.full_name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        repo.private ? "bg-orange-50 text-orange-400" : "bg-gray-100 text-gray-500"
                      }`}>
                        {repo.private ? "Private" : "Public"}
                      </span>
                      {repo.language && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-400">
                          {repo.language}
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-xs mt-0.5 truncate text-gray-400">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Star className="w-3 h-3" />{repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <GitFork className="w-3 h-3" />{repo.forks_count}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />{timeAgo(repo.pushed_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleConnect(repo)}
                  disabled={connecting === repo.full_name}
                  className="ml-4 flex-shrink-0 w-32 font-semibold gap-2 bg-[#00D964] hover:bg-[#00c057] text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-100"
                >
                  {connecting === repo.full_name ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 border-t-gray-400 animate-spin" />
                      <span>Proses...</span>
                    </>
                  ) : "Connect"}
                </Button>
              </div>
            ))}

            <div className="p-4 border-t border-gray-100">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
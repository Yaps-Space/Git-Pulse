"use client"
import { useSession } from "next-auth/react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

interface Repo {
  id:         number
  full_name:  string
  name:       string
  owner:      { login: string; avatar_url: string }
  description: string | null
  language:   string | null
  stargazers_count: number
  forks_count: number
  pushed_at:  string
  private:    boolean
}

export default function ConnectRepoPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [repos,       setRepos]       = useState<Repo[]>([])
  const [filtered,    setFiltered]    = useState<Repo[]>([])
  const [loading,     setLoading]     = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [connecting,  setConnecting]  = useState<string | null>(null)
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(true)
  const [search,      setSearch]      = useState("")
  const [filter,      setFilter]      = useState("all")

  const fetchRepos = useCallback(async (pageNum: number, append = false) => {
    if (!session?.accessToken) return
    pageNum === 1 ? setLoading(true) : setLoadingMore(true)

    try {
      const res  = await fetch(`/api/repos?page=${pageNum}&filter=${filter}`)
      const data = await res.json()
      const repoList = data.repos || []
      if (repoList.length < 20) setHasMore(false)
      else setHasMore(true)
      setRepos(prev => append ? [...prev, ...repoList] : repoList)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [session?.accessToken, filter])

  useEffect(() => {
    setPage(1)
    setHasMore(true)
    fetchRepos(1, false)
  }, [filter, fetchRepos])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      repos.filter(r =>
        r.full_name.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q)
      )
    )
  }, [search, repos])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchRepos(next, true)
  }

  const connectRepo = async (repo: Repo) => {
    setConnecting(repo.full_name)
    try {
      const res = await fetch("/api/repos/analyze", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ fullName: repo.full_name }),
      })
      if (res.ok) router.push("/dashboard")
    } catch (e) {
      console.error(e)
    } finally {
      setConnecting(null)
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return "Hari ini"
    if (days === 1) return "Kemarin"
    if (days < 30)  return `${days} hari lalu`
    if (days < 365) return `${Math.floor(days / 30)} bulan lalu`
    return `${Math.floor(days / 365)} tahun lalu`
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white"
          style={{ color: "#555" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>Connect Repository</h1>
          <p className="text-sm" style={{ color: "#888" }}>Pilih repository yang ingin dianalisis</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Cari nama repository..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none border"
            style={{ borderColor: "#E0E0E0", color: "#333" }}
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 rounded-xl text-sm outline-none border"
          style={{ borderColor: "#E0E0E0", color: "#333" }}>
          <option value="all">Semua</option>
          <option value="owner">Milik Saya</option>
          <option value="collaborator">Kolaborator</option>
          <option value="organization_member">Organisasi</option>
        </select>
      </div>

      {/* Repo List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "#2E86C1", borderTopColor: "transparent" }}/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-4xl">🔍</span>
            <p className="font-medium" style={{ color: "#333" }}>Tidak ada repository ditemukan</p>
          </div>
        ) : (
          <>
            {filtered.map((repo, i) => (
              <div key={repo.id}
                className="flex items-center justify-between px-6 py-4 border-b hover:bg-gray-50 transition-colors"
                style={{ borderColor: "#F0F0F0" }}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img src={repo.owner.avatar_url} alt="" className="w-9 h-9 rounded-full flex-shrink-0"/>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm" style={{ color: "#1E3A5F" }}>{repo.full_name}</p>
                      {repo.private && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FFF3E0", color: "#F0883E" }}>
                          Private
                        </span>
                      )}
                      {repo.language && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#EBF5FB", color: "#2E86C1" }}>
                          {repo.language}
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: "#888" }}>{repo.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs" style={{ color: "#aaa" }}>⭐ {repo.stargazers_count}</span>
                      <span className="text-xs" style={{ color: "#aaa" }}>🍴 {repo.forks_count}</span>
                      <span className="text-xs" style={{ color: "#aaa" }}>🕐 {timeAgo(repo.pushed_at)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => connectRepo(repo)}
                  disabled={connecting === repo.full_name}
                  className="ml-4 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 flex-shrink-0 flex items-center gap-2"
                  style={{ background: "#2E86C1", opacity: connecting === repo.full_name ? 0.7 : 1 }}>
                  {connecting === repo.full_name ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"/>
                      Menganalisis...
                    </>
                  ) : "Connect"}
                </button>
              </div>
            ))}

            {/* Load More */}
            {hasMore && !search && (
              <div className="flex justify-center p-4">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ background: "#F4F6F9", color: "#555" }}>
                  {loadingMore ? "Memuat..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
import { GithubRepo } from "@/features/repository/types"

interface RepoPageResponse {
  ok:     boolean
  status: number
  repos:  GithubRepo[]
  error?: string
}

export async function fetchRepoPage(page: number, filter: string, provider: string): Promise<RepoPageResponse> {
  const res  = await fetch(`/api/repo?page=${page}&filter=${filter}&provider=${provider}`)
  const data = await res.json()
  return { ok: res.ok, status: res.status, repos: data.repos ?? [], error: data.error }
}
import useSWR from "swr"
import { RepoDetail } from "../types/RepoDetail"

interface UseRepoDetailResult {
  repo:    RepoDetail | null
  loading: boolean
  error:   string | null
  refresh: () => void
}

const fetcher = (url: string): Promise<RepoDetail> => fetch(url).then(r => {
  if (!r.ok) throw new Error("Failed to fetch")
  return r.json()
})

export function useRepoDetail(id: string): UseRepoDetailResult {
  const { data, isLoading, error, mutate } = useSWR<RepoDetail>(
    `/api/repo/${id}`,
    fetcher,
    {
      revalidateOnFocus:     true,
      revalidateOnReconnect: true,
      dedupingInterval:      5_000,
    }
  )

  return {
    repo:    data ?? null,
    loading: isLoading,
    error:   error ? "Gagal memuat detail repository" : null,
    refresh: mutate,
  }
}
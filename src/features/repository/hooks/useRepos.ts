import useSWR from "swr"
import { Repo } from "../types"

interface UseReposResult {
  repos:   Repo[]
  loading: boolean
  error:   string | null
  refresh: () => void
}

const fetcher = (url: string): Promise<{ repos: Repo[] }> => fetch(url).then(r => r.json())

export function useRepos(): UseReposResult {
  const { data, isLoading, error, mutate } = useSWR<{ repos: Repo[] }>(
    "/api/repo/list",
    fetcher,
    {
      revalidateOnFocus:     true,
      revalidateOnReconnect: true,
      dedupingInterval:      5_000,
      fallbackData:          { repos: [] },
    }
  )

  return {
    repos:   data?.repos ?? [],
    loading: isLoading,
    error:   error ? "Gagal memuat repository" : null,
    refresh: mutate,
  }
}
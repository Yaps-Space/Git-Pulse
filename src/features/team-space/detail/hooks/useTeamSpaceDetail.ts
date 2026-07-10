import useSWR from "swr"
import { TeamSpaceDetail } from "../types/TeamSpaceDetail"

interface UseTeamSpaceDetailResult {
  detail:  TeamSpaceDetail | null
  loading: boolean
  error:   string | null
  refresh: (optimisticFn?: (data: TeamSpaceDetail) => TeamSpaceDetail) => void
}

const fetcher = (url: string): Promise<TeamSpaceDetail> => fetch(url).then(r => {
  if (!r.ok) throw new Error("Failed to fetch")
  return r.json()
})

export function useTeamSpaceDetail(id: string): UseTeamSpaceDetailResult {
  const { data, isLoading, error, mutate } = useSWR<TeamSpaceDetail>(
    `/api/team-space/${id}`,
    fetcher,
    {
      revalidateOnFocus:     true,
      revalidateOnReconnect: true,
      dedupingInterval:      3_000,
      refreshInterval: (data) => {
        const hasAnalyzing = data?.members.some(m => m.status === "analyzing")
        return hasAnalyzing ? 3_000 : 0
      },
    }
  )

  const refresh = (optimisticFn?: (data: TeamSpaceDetail) => TeamSpaceDetail) => {
    if (optimisticFn && data) {
      mutate(optimisticFn(data), { revalidate: false })
    } else {
      mutate()
    }
  }

  return {
    detail:  data ?? null,
    loading: isLoading,
    error:   error ? "Gagal memuat detail Team Space" : null,
    refresh,
  }
}
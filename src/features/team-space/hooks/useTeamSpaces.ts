import useSWR from "swr"
import { TeamSpace } from "../types/TeamSpace"

interface UseTeamSpacesResult {
  teamSpaces: TeamSpace[]
  loading:    boolean
  error:      string | null
  refresh:    () => void
}

const fetcher = (url: string): Promise<TeamSpace[]> => fetch(url).then(r => r.json())

export function useTeamSpaces(): UseTeamSpacesResult {
  const { data, isLoading, error, mutate } = useSWR<TeamSpace[]>("/api/team-space", fetcher, {
    revalidateOnFocus:     true,
    revalidateOnReconnect: true,
    refreshInterval:       30_000,
    dedupingInterval:      5_000,
    fallbackData:          [],
  })

  return {
    teamSpaces: data ?? [],
    loading:    isLoading,
    error:      error ? "Gagal memuat Team Space" : null,
    refresh:    mutate,
  }
}
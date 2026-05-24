import useSWR from "swr"
import { TeamSpaceDetail } from "../types/TeamSpaceDetail"

interface UseTeamSpaceDetailResult {
  detail:  TeamSpaceDetail | null;
  loading: boolean;
  error:   string | null;
  refresh: () => void;
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
      dedupingInterval:      5_000,
    }
  )

  return {
    detail:  data ?? null,
    loading: isLoading,
    error:   error ? "Gagal memuat detail Team Space" : null,
    refresh: mutate,
  }
}
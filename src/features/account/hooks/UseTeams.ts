import useSWR from "swr"

export interface Team {
  id:          string;
  name:        string;
  role:        string;
  memberCount: number;
}

interface UseTeamsResult {
  teams:   Team[];
  loading: boolean;
  refresh: () => void;
}

const fetcher = (url: string): Promise<Team[]> => fetch(url).then(r => r.json())

export function useTeams(): UseTeamsResult {
  const { data, isLoading, mutate } = useSWR<Team[]>("/api/team-space", fetcher, {
    revalidateOnFocus:     true,
    revalidateOnReconnect: true,
    refreshInterval:       30_000,
    dedupingInterval:      5_000,
    fallbackData:          [],
  })

  return {
    teams:   data ?? [],
    loading: isLoading,
    refresh: mutate,
  }
}
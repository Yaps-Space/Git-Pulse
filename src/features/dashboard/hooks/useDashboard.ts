import useSWR from "swr"
import { DashboardRepo } from "../types"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useDashboardRepos() {
  const { data, isLoading, mutate } = useSWR<DashboardRepo[]>(
    "/api/dashboard",
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 10_000, fallbackData: [] }
  )
  return { repos: data ?? [], loading: isLoading, refresh: mutate }
}

export function useDashboardTeams() {
  const { data, isLoading } = useSWR<{ id: string; name: string; role: string; memberCount: number }[]>(
    "/api/team-space",
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 10_000, fallbackData: [] }
  )
  return { teams: data ?? [], loading: isLoading }
}
import useSWR from "swr"

interface Result {
  connectedFullNames: string[]
  loading:            boolean
  refresh:            () => void
}

const fetcher = (url: string) => fetch(url).then(r => r.json()).then(d => d.fullNames ?? [])

export function useConnectedRepos(): Result {
  const { data, isLoading, mutate } = useSWR<string[]>(
    "/api/repo/connected",
    fetcher,
    {
      revalidateOnFocus:     true,
      revalidateOnReconnect: true,
      dedupingInterval:      3_000,
      fallbackData:          [],
    }
  )

  return {
    connectedFullNames: data ?? [],
    loading:            isLoading,
    refresh:            mutate,
  }
}
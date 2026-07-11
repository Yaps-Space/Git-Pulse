import useSWR, { useSWRConfig } from "swr"
import { useCallback } from "react"
import { AccountData } from "../types/Account";

interface UseAccountResult {
  account: AccountData | null;
  loading: boolean;
  refresh: () => Promise<AccountData | undefined>;
}

const fetcher = (url: string): Promise<AccountData> => fetch(url).then(r => r.json())

export function useAccount(): UseAccountResult {
  const { mutate } = useSWRConfig()
  const { data, isLoading } = useSWR<AccountData>("/api/account", fetcher, {
    revalidateOnFocus:     true,
    revalidateOnReconnect: true,
    refreshInterval:       30_000,
    dedupingInterval:      5_000,
  })

  const refresh = useCallback(() => mutate<AccountData>("/api/account"), [mutate])

  return {
    account: data ?? null,
    loading: isLoading,
    refresh,
  }
}
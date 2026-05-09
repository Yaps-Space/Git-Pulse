import useSWR from "swr"
import { AccountData } from "../types/Account";

interface UseAccountResult {
  account: AccountData | null;
  loading: boolean;
}

const fetcher = (url: string): Promise<AccountData> => fetch(url).then(r => r.json())

export function useAccount(): UseAccountResult {
  const { data, isLoading } = useSWR<AccountData>("/api/account", fetcher, {
    revalidateOnFocus:     true,
    revalidateOnReconnect: true,
    refreshInterval:       30_000,
    dedupingInterval:      5_000,
  })

  return {
    account: data ?? null,
    loading: isLoading,
  }
}
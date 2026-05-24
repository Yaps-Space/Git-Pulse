import { useState } from "react"
import { useSWRConfig } from "swr"
import { analyzeRepo } from "../services/repoService"

export function useRefreshRepo(id: string) {
  const [loading, setLoading] = useState(false)
  const { mutate }            = useSWRConfig()

  const refresh = async (fullName: string) => {
    setLoading(true)
    try {
      await analyzeRepo(fullName)
      mutate(`/api/repo/${id}`)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return { loading, refresh }
}
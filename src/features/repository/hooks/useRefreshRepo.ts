import { useState } from "react"
import { useRouter } from "next/navigation"
import { analyzeRepo } from "../services/repoService"

export function useRefreshRepo() {
  const [loading, setLoading] = useState(false)
  const router                = useRouter()

  const refresh = async (fullName: string) => {
    setLoading(true)
    try {
      await analyzeRepo(fullName)
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return { loading, refresh }
}
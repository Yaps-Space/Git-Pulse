import { useState } from "react"
import { useSWRConfig } from "swr"
import { toast } from "sonner"
import { analyzeRepo } from "../services/repoService"

export function useRefreshRepo(id: string, teamSpaceId?: string) {
  const [loading, setLoading] = useState(false)
  const { mutate }            = useSWRConfig()

  const refresh = async (fullName: string) => {
    setLoading(true)
    try {
      const result = await analyzeRepo(fullName, { teamSpaceId })
      if (!result.success) {
        toast.error(result.error ?? "Gagal menganalisis ulang repository.")
        return
      }
      mutate(`/api/repo/${id}`)
      toast.success("Repository berhasil dianalisis ulang.")
    } catch (e) {
      console.error(e)
      toast.error("Gagal menganalisis ulang repository.")
    } finally {
      setLoading(false)
    }
  }

  return { loading, refresh }
}
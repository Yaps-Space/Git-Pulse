import { useState } from "react"
import { useSWRConfig } from "swr"
import { toast } from "sonner"
import { analyzeRepo } from "../services/repoService"

export function useRefreshRepo(id: string) {
  const [loading, setLoading] = useState(false)
  const { mutate }            = useSWRConfig()

  const refresh = async (fullName: string) => {
    setLoading(true)
    try {
      await analyzeRepo(fullName)
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
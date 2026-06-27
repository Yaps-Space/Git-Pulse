import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import { toast } from "sonner"

export function useDisconnectRepo() {
  const [loading, setLoading] = useState(false)
  const router                = useRouter()
  const { mutate }            = useSWRConfig()

  const disconnect = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/repo/${id}`, { method: "DELETE" })
      if (res.ok) {
        await mutate("/api/repo/list")
        await mutate("/api/repo/connected")
        toast.success("Repository berhasil di-disconnect.")
        router.push("/repository")
      } else {
        toast.error("Gagal disconnect repository.")
      }
    } catch (e) {
      console.error(e)
      toast.error("Tidak bisa menghubungi server.")
    } finally {
      setLoading(false)
    }
  }

  return { loading, disconnect }
}
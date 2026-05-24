import { useState } from "react"
import { useRouter } from "next/navigation"

export function useDisconnectRepo() {
  const [loading, setLoading] = useState(false)
  const router                = useRouter()

  const disconnect = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/repo/${id}`, { method: "DELETE" })
      if (res.ok) router.push("/repository")
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return { loading, disconnect }
}
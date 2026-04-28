import { useEffect, useState } from "react"
import { TeamSpaceDetail } from "../types/TeamSpace"

interface UseTeamSpaceDetailResult {
  detail:  TeamSpaceDetail | null;
  loading: boolean;
  error:   string | null;
  refresh: () => void;
}

export function useTeamSpaceDetail(id: string): UseTeamSpaceDetailResult {
  const [detail,  setDetail]  = useState<TeamSpaceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [tick,    setTick]    = useState(0)

  useEffect(() => {
    async function fetch_() {
      setLoading(true)
      try {
        const res  = await fetch(`/api/team-space/${id}`)
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setDetail(data)
      } catch {
        setError("Gagal memuat detail Team Space")
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [id, tick])

  return { detail, loading, error, refresh: () => setTick(t => t + 1) }
}
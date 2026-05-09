import { useEffect, useState } from "react"
import { TeamSpace } from "../types/TeamSpace"

interface UseTeamSpacesResult {
  teamSpaces: TeamSpace[];
  loading:    boolean;
  error:      string | null;
  refresh:    () => void;
}

export function useTeamSpaces(): UseTeamSpacesResult {
  const [teamSpaces, setTeamSpaces] = useState<TeamSpace[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [tick,       setTick]       = useState(0)

  useEffect(() => {
    async function fetch_() {
      setLoading(true)
      try {
        const res  = await fetch("/api/team-space")
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setTeamSpaces(data)
      } catch {
        setError("Gagal memuat Team Space")
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [tick])

  return { teamSpaces, loading, error, refresh: () => setTick(t => t + 1) }
}
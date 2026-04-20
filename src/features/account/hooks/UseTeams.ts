import { useEffect, useState } from "react"

export interface Team {
  id:          string;
  name:        string;
  role:        string;
  memberCount: number;
}

interface UseTeamsResult {
  teams:   Team[];
  loading: boolean;
  error:   string | null;
}

export function useTeams(): UseTeamsResult {
  const [teams,   setTeams]   = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch("/api/team-space")
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setTeams(data)
      } catch {
        setError("Gagal memuat data team")
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [])

  return { teams, loading, error }
}
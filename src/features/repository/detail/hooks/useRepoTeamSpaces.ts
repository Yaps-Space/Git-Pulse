import useSWR from "swr"

interface TeamSpace {
  id:          string
  name:        string
  description: string | null
  role:        string
  repoNames:   string[]
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useRepoTeamSpaces(repoFullName: string) {
  const { data = [] } = useSWR<TeamSpace[]>("/api/team-space", fetcher, {
    revalidateOnFocus: true,
    dedupingInterval:  5_000,
    fallbackData:      [],
  })

  return {
    teamSpaces: data.filter(t => t.repoNames.includes(repoFullName)),
  }
}
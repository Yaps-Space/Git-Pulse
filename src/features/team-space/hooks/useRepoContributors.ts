import { useState, useEffect } from "react"
import { fetchRepoContributors, Contributor } from "../services/TeamSpaceService"

export function useRepoContributors(selectedRepos: string[]) {
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [loadingContributors, setLoadingContributors] = useState(false)

  useEffect(() => {
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingContributors(true)

    Promise.all(selectedRepos.map(r => fetchRepoContributors(r)))
      .then(results => {
        if (!active) return
        const merged = new Map<string, Contributor>()
        results.flat().forEach(c => { if (!merged.has(c.login)) merged.set(c.login, c) })
        setContributors(Array.from(merged.values()))
      })
      .finally(() => { if (active) setLoadingContributors(false) })

    return () => { active = false }
  }, [selectedRepos])

  return { contributors, loadingContributors }
}
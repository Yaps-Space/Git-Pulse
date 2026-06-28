import { useState, useEffect } from "react"
import { ComboboxOption } from "@/shared/components/commons/InfiniteCombobox"
import { fetchRepos } from "../services/TeamSpaceService"
import { GitHubIcon, GitLabIcon } from "@/shared/components/commons/ProviderIcons"

export function useRepoOptions() {
  const [repoOptions,  setRepoOptions]  = useState<ComboboxOption[]>([])
  const [loadingRepos, setLoadingRepos] = useState(true)

  useEffect(() => {
    fetchRepos()
      .then(repos => setRepoOptions(repos.map(r => ({
        id:    r.fullName,
        label: r.fullName,
        icon:  r.provider === "gitlab"
          ? <GitLabIcon className="w-3.5 h-3.5 text-[#fc6d26]" />
          : <GitHubIcon className="w-3.5 h-3.5 text-gray-600" />,
      }))))
      .finally(() => setLoadingRepos(false))
  }, [])

  return { repoOptions, loadingRepos }
}
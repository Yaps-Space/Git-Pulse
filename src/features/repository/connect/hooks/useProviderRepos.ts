import useSWR from "swr"
import { GithubRepo, Provider } from "@/features/repository/types"
import { fetchRepoPage } from "../services/repoService"
import { FetchState } from "../types"

interface RepoFetchError extends Error {
  status: "no_token" | "expired" | "server_error"
}

async function fetchAllRepos(filter: string, provider: Provider): Promise<GithubRepo[]> {
  let allRepos: GithubRepo[] = []
  let currentPage            = 1

  while (true) {
    const { ok, status, repos: batch, error } = await fetchRepoPage(currentPage, filter, provider)

    if (status === 401) {
      const err = new Error(error ?? "Unauthorized") as RepoFetchError
      err.status = error === "No GitHub token" || error === "No GitLab token" ? "no_token" : "expired"
      throw err
    }

    if (status === 502) {
      const err = new Error(error ?? "Provider server error") as RepoFetchError
      err.status = "server_error"
      throw err
    }

    if (!ok) {
      const err = new Error(error ?? "Failed to fetch") as RepoFetchError
      err.status = "expired"
      throw err
    }

    allRepos = [...allRepos, ...batch]
    if (batch.length < 20) break
    currentPage++
  }

  return allRepos
}

interface Result {
  repos:      GithubRepo[]
  fetchState: FetchState
  reload:     () => void
}

export function useProviderRepos(filter: string, provider: Provider): Result {
  const { data, error, isLoading, mutate } = useSWR<GithubRepo[], RepoFetchError>(
    ["repo-list", filter, provider],
    () => fetchAllRepos(filter, provider),
    { revalidateOnFocus: false, fallbackData: [] }
  )

  const fetchState: FetchState = isLoading
    ? "loading"
    : error
      ? error.status
      : (data?.length ?? 0) === 0
        ? "empty"
        : "ok"

  return { repos: data ?? [], fetchState, reload: () => mutate() }
}
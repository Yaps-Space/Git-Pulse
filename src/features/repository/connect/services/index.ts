export async function fetchProviderRepos(page: number, filter: string, provider?: string): Promise<{ repos: import("../types").GithubRepo[] }> {
  const providerParam = provider ? `&provider=${encodeURIComponent(provider)}` : ""
  const res  = await fetch(`/api/repo?page=${page}&filter=${filter}${providerParam}`)
  return res.json()
}
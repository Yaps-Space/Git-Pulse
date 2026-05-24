export async function fetchGithubRepos(page: number, filter: string): Promise<{ repos: import("../types").GithubRepo[] }> {
  const res  = await fetch(`/api/repo?page=${page}&filter=${filter}`)
  return res.json()
}
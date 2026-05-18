export async function analyzeRepo(fullName: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch("/api/repo/analyze", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ fullName }),
  })
  const data = await res.json()
  if (!res.ok) return { success: false, error: data.error }
  return { success: true }
}

export async function fetchGithubRepos(page: number, filter: string): Promise<{ repos: import("../types").GithubRepo[] }> {
  const res  = await fetch(`/api/repo?page=${page}&filter=${filter}`)
  return res.json()
}
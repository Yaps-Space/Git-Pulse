export async function analyzeRepo(fullName: string, options?: { provider?: string; repoId?: number }): Promise<{ success: boolean; error?: string }> {
  const body: any = { fullName }
  if (options?.provider) body.provider = options.provider
  if (options?.repoId)   body.repoId   = options.repoId

  const res = await fetch("/api/repo/analyze", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) return { success: false, error: data.error }
  return { success: true }
}
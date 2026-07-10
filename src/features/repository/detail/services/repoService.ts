export interface AnalyzeRepoOptions {
  provider?: string
  repoId?: number
}

interface AnalyzeRepoBody {
  fullName: string
  provider?: string
  repoId?: number
}

interface AnalyzeRepoResult {
  success: boolean
  error?: string
}

async function callAnalyze(body: AnalyzeRepoBody): Promise<{ status: number; data: { error?: string; pending?: boolean } }> {
  const res = await fetch("/api/repo/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return { status: res.status, data }
}

export async function analyzeRepo(fullName: string, options?: AnalyzeRepoOptions, maxWaitMs = 90_000): Promise<AnalyzeRepoResult> {
  const body: AnalyzeRepoBody = { fullName }
  if (options?.provider) body.provider = options.provider
  if (options?.repoId) body.repoId = options.repoId

  const startedAt = Date.now()
  let delay = 2000

  while (true) {
    const { status, data } = await callAnalyze(body)

    if (status === 202) {
      if (Date.now() - startedAt >= maxWaitMs) {
        return { success: false, error: "GitHub masih memproses statistik repo ini, coba analisis ulang beberapa saat lagi" }
      }
      await new Promise(resolve => setTimeout(resolve, delay))
      delay = Math.min(delay * 1.5, 6000)
      continue
    }

    if (status < 200 || status >= 300) return { success: false, error: data.error }
    return { success: true }
  }
}
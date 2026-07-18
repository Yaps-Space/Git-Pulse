import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { getValidGitLabToken } from "@/shared/lib/gitlab"
import { GithubRepo } from "@/features/repository/types"

interface GitLabProject {
  id:                 number
  path_with_namespace: string
  path:               string
  name:               string
  description:        string | null
  visibility:         string
  language:           string | null
  star_count:         number
  forks_count:        number
  last_activity_at:   string | null
  last_push_at:       string | null
  owner?: {
    avatar_url: string | null
    username:   string | null
  }
  namespace?: {
    avatar_url: string | null
    name:       string | null
  }
}

function mapGitLabProject(p: GitLabProject): GithubRepo {
  return {
    id:               p.id,
    full_name:        p.path_with_namespace ?? p.path ?? p.name,
    name:             p.name,
    description:      p.description ?? null,
    private:          p.visibility !== "public",
    language:         p.language ?? null,
    stargazers_count: p.star_count ?? 0,
    forks_count:      p.forks_count ?? 0,
    pushed_at:        p.last_activity_at ?? p.last_push_at ?? null,
    owner: {
      avatar_url: p.owner?.avatar_url ?? p.namespace?.avatar_url ?? null,
      login:      p.owner?.username ?? p.namespace?.name
        ?? (p.path_with_namespace ? p.path_with_namespace.split("/")[0] : "") ?? "",
    },
  }
}

async function fetchWithRetry(url: string, token: string, retries = 1): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok || res.status < 500 || attempt >= retries) return res
    await new Promise(r => setTimeout(r, 800))
  }
}

async function fetchGitLabRepos(token: string, page: string, userId: string, linkedGitlab: { id?: string }) {
  const baseParams = `membership=true&simple=true&per_page=20&page=${page}&order_by=last_activity_at&sort=desc`
  let res  = await fetchWithRetry(`https://gitlab.com/api/v4/projects?${baseParams}`, token)
  let data = await res.json() as GitLabProject[]

  if (!res.ok && res.status >= 500) {
    console.error("GitLab projects fetch failed, retrying minimal query:", res.status, JSON.stringify(data))
    res  = await fetchWithRetry(`https://gitlab.com/api/v4/projects?membership=true&simple=true&per_page=20&page=${page}`, token)
    data = await res.json() as GitLabProject[]
  }

  if (!res.ok) {
    console.error("GitLab projects fetch failed:", res.status, JSON.stringify(data))
    return { error: (data as unknown as { message?: string })?.message ?? "GitLab error", status: res.status, repos: [] }
  }

  if (Array.isArray(data) && data.length === 0 && linkedGitlab.id) {
    res  = await fetchWithRetry(
      `https://gitlab.com/api/v4/users/${linkedGitlab.id}/projects?simple=true&per_page=20&page=${page}&order_by=last_activity_at&sort=desc`,
      token
    )
    data = await res.json() as GitLabProject[]
    if (!res.ok) {
      console.error("GitLab user projects fetch failed:", res.status, JSON.stringify(data))
      return { error: (data as unknown as { message?: string })?.message ?? "GitLab error", status: res.status, repos: [] }
    }
  }

  return { repos: Array.isArray(data) ? data.map(mapGitLabProject) : [] }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page          = searchParams.get("page")     || "1"
  const filter        = searchParams.get("filter")   || "all"
  const providerParam = (searchParams.get("provider") || "").toLowerCase()

  try {
    const userSnap = await getDoc(doc(db, "users", session.user.id))
    const linked   = userSnap.exists() ? (userSnap.data().linkedProviders ?? {}) : {}

    if (providerParam === "github") {
      if (!linked.github?.accessToken) return NextResponse.json({ error: "No GitHub token", repos: [] }, { status: 401 })
      const affiliation = filter === "all" ? "owner,collaborator,organization_member" : filter
      const res  = await fetch(
        `https://api.github.com/user/repos?affiliation=${affiliation}&per_page=20&page=${page}&sort=pushed&direction=desc`,
        { headers: { Authorization: `Bearer ${linked.github.accessToken}`, "X-GitHub-Api-Version": "2022-11-28" } }
      )
      const data = await res.json()
      if (!res.ok) return NextResponse.json({ error: data.message ?? "GitHub error", repos: [] }, { status: res.status })
      return NextResponse.json({ repos: Array.isArray(data) ? data : [] })
    }

    if (providerParam === "gitlab") {
      const token = await getValidGitLabToken(session.user.id)
      if (!token) return NextResponse.json({ error: "No GitLab token", repos: [] }, { status: 401 })
      const result = await fetchGitLabRepos(token, page, session.user.id, linked.gitlab ?? {})
      if ("error" in result && result.repos.length === 0) {
        const status = result.status === 401 || result.status === 403 ? 401 : 502
        return NextResponse.json(result, { status })
      }
      return NextResponse.json(result)
    }

    if (linked.github?.accessToken) {
      const affiliation = filter === "all" ? "owner,collaborator,organization_member" : filter
      const res  = await fetch(
        `https://api.github.com/user/repos?affiliation=${affiliation}&per_page=20&page=${page}&sort=pushed&direction=desc`,
        { headers: { Authorization: `Bearer ${linked.github.accessToken}`, "X-GitHub-Api-Version": "2022-11-28" } }
      )
      const data = await res.json()
      if (!res.ok) return NextResponse.json({ error: data.message ?? "GitHub error", repos: [] }, { status: res.status })
      return NextResponse.json({ repos: Array.isArray(data) ? data : [] })
    }

    if (linked.gitlab?.accessToken) {
      const token = await getValidGitLabToken(session.user.id)
      if (!token) return NextResponse.json({ error: "No GitLab token", repos: [] }, { status: 401 })
      const result = await fetchGitLabRepos(token, page, session.user.id, linked.gitlab ?? {})
      if ("error" in result && result.repos.length === 0) {
        const status = result.status === 401 || result.status === 403 ? 401 : 502
        return NextResponse.json(result, { status })
      }
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: "No connected provider", repos: [] }, { status: 401 })
  } catch (e) {
    console.error("Fetch error:", e)
    return NextResponse.json({ repos: [] }, { status: 500 })
  }
}
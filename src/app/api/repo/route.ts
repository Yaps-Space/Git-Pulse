import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page   = searchParams.get("page")   || "1"
  const filter = searchParams.get("filter") || "all"
  const providerParam = (searchParams.get("provider") || "").toLowerCase()

  try {
    // Ambil token provider dari Firestore (linkedProviders)
    const userSnap = await getDoc(doc(db, "users", session.user.id))
    const linked = userSnap.exists() ? (userSnap.data().linkedProviders ?? {}) : {}

    // Prioritaskan provider query param jika diberikan
    if (providerParam === "github") {
      if (!linked.github?.accessToken) return NextResponse.json({ error: "No GitHub token" , repos: [] }, { status: 401 })
      const affiliation = filter === "all" ? "owner,collaborator,organization_member" : filter
      const res = await fetch(
        `https://api.github.com/user/repos?affiliation=${affiliation}&per_page=20&page=${page}&sort=pushed&direction=desc`,
        { headers: { Authorization: `Bearer ${linked.github.accessToken}`, "X-GitHub-Api-Version": "2022-11-28" } }
      )
      const data = await res.json()
      if (!res.ok) return NextResponse.json({ error: data.message ?? "GitHub error", repos: [] }, { status: res.status })
      return NextResponse.json({ repos: Array.isArray(data) ? data : [] })
    }

    if (providerParam === "gitlab") {
      if (!linked.gitlab?.accessToken) return NextResponse.json({ error: "No GitLab token" , repos: [] }, { status: 401 })

      // coba projects membership
      let res = await fetch(
        `https://gitlab.com/api/v4/projects?membership=true&per_page=20&page=${page}&order_by=last_activity_at&sort=desc`,
        { headers: { Authorization: `Bearer ${linked.gitlab.accessToken}` } }
      )
      let data = await res.json()
      if (!res.ok) return NextResponse.json({ error: data.message ?? "GitLab error", repos: [] }, { status: res.status })

      // jika kosong dan kita punya gitlab id, coba ambil owned projects
      if (Array.isArray(data) && data.length === 0 && linked.gitlab.id) {
        const uid = linked.gitlab.id
        res = await fetch(
          `https://gitlab.com/api/v4/users/${uid}/projects?per_page=20&page=${page}&order_by=last_activity_at&sort=desc`,
          { headers: { Authorization: `Bearer ${linked.gitlab.accessToken}` } }
        )
        data = await res.json()
        if (!res.ok) return NextResponse.json({ error: data.message ?? "GitLab error", repos: [] }, { status: res.status })
      }

      const mapped = Array.isArray(data) ? data.map((p: any) => ({
        id: p.id,
        full_name: p.path_with_namespace ?? p.path ?? p.name,
        description: p.description ?? null,
        private: (p.visibility && p.visibility !== "public") ?? false,
        language: p.language ?? null,
        stargazers_count: p.star_count ?? 0,
        forks_count: p.forks_count ?? 0,
        pushed_at: p.last_activity_at ?? p.last_push_at ?? null,
        owner: {
          avatar_url: p.owner?.avatar_url ?? p.namespace?.avatar_url ?? null,
          login: p.owner?.username ?? p.namespace?.name ?? (p.path_with_namespace ? p.path_with_namespace.split("/")[0] : null),
        }
      })) : []
      return NextResponse.json({ repos: mapped })
    }

    // Jika tidak ada provider param, gunakan fallback: github -> gitlab
    if (linked.github?.accessToken) {
      const affiliation = filter === "all" ? "owner,collaborator,organization_member" : filter
      const res = await fetch(
        `https://api.github.com/user/repos?affiliation=${affiliation}&per_page=20&page=${page}&sort=pushed&direction=desc`,
        { headers: { Authorization: `Bearer ${linked.github.accessToken}`, "X-GitHub-Api-Version": "2022-11-28" } }
      )
      const data = await res.json()
      if (!res.ok) return NextResponse.json({ error: data.message ?? "GitHub error", repos: [] }, { status: res.status })
      return NextResponse.json({ repos: Array.isArray(data) ? data : [] })
    }

    if (linked.gitlab?.accessToken) {
      // coba projects membership
      let res = await fetch(
        `https://gitlab.com/api/v4/projects?membership=true&per_page=20&page=${page}&order_by=last_activity_at&sort=desc`,
        { headers: { Authorization: `Bearer ${linked.gitlab.accessToken}` } }
      )
      let data = await res.json()
      if (!res.ok) return NextResponse.json({ error: data.message ?? "GitLab error", repos: [] }, { status: res.status })

      // jika kosong dan kita punya gitlab id, coba ambil owned projects
      if (Array.isArray(data) && data.length === 0 && linked.gitlab.id) {
        const uid = linked.gitlab.id
        res = await fetch(
          `https://gitlab.com/api/v4/users/${uid}/projects?per_page=20&page=${page}&order_by=last_activity_at&sort=desc`,
          { headers: { Authorization: `Bearer ${linked.gitlab.accessToken}` } }
        )
        data = await res.json()
        if (!res.ok) return NextResponse.json({ error: data.message ?? "GitLab error", repos: [] }, { status: res.status })
      }

      const mapped = Array.isArray(data) ? data.map((p: any) => ({
        id: p.id,
        full_name: p.path_with_namespace ?? p.path ?? p.name,
        description: p.description ?? null,
        private: (p.visibility && p.visibility !== "public") ?? false,
        language: p.language ?? null,
        stargazers_count: p.star_count ?? 0,
        forks_count: p.forks_count ?? 0,
        pushed_at: p.last_activity_at ?? p.last_push_at ?? null,
        owner: {
          avatar_url: p.owner?.avatar_url ?? p.namespace?.avatar_url ?? null,
          login: p.owner?.username ?? p.namespace?.name ?? (p.path_with_namespace ? p.path_with_namespace.split("/")[0] : null),
        }
      })) : []
      return NextResponse.json({ repos: mapped })
    }

    // Tidak ada provider terhubung
    return NextResponse.json({ error: "No connected provider", repos: [] }, { status: 401 })
  } catch (e) {
    console.error("Fetch error:", e)
    return NextResponse.json({ repos: [] }, { status: 500 })
  }
}
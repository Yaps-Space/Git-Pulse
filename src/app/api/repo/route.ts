import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page   = searchParams.get("page")   || "1"
  const filter = searchParams.get("filter") || "all"

  const affiliation = filter === "all"
    ? "owner,collaborator,organization_member"
    : filter

  try {
    const res = await fetch(
      `https://api.github.com/user/repos?affiliation=${affiliation}&per_page=20&page=${page}&sort=pushed&direction=desc`,
      { headers: { Authorization: `Bearer ${session.accessToken}`, "X-GitHub-Api-Version": "2022-11-28" } }
    )

    const data = await res.json()
    console.log("GitHub API status:", res.status)
    console.log("GitHub API response:", JSON.stringify(data).slice(0, 200))

    if (!res.ok) {
      return NextResponse.json({ error: data.message, repos: [] }, { status: res.status })
    }

    return NextResponse.json({ repos: Array.isArray(data) ? data : [] })
  } catch (e) {
    console.error("Fetch error:", e)
    return NextResponse.json({ repos: [] }, { status: 500 })
  }
}
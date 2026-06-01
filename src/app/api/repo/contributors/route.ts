import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const repoFullName = req.nextUrl.searchParams.get("repo")
  if (!repoFullName) return NextResponse.json({ error: "Missing repo" }, { status: 400 })

  const headers = { Authorization: `Bearer ${session.accessToken}` }

  try {
    let users: { login: string; avatar_url: string }[] = []

    const collabRes = await fetch(
      `https://api.github.com/repos/${repoFullName}/collaborators?per_page=100`,
      { headers }
    )

    if (collabRes.ok) {
      const data = await collabRes.json()
      if (Array.isArray(data)) {
        users = data.map((c: { login: string; avatar_url: string }) => ({
          login:      c.login,
          avatar_url: c.avatar_url,
        }))
      }
    } else {
      let page = 1
      while (true) {
        const res  = await fetch(
          `https://api.github.com/repos/${repoFullName}/contributors?per_page=100&page=${page}`,
          { headers }
        )
        if (!res.ok) break
        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) break
        users = [...users, ...data.map((c: { login: string; avatar_url: string }) => ({
          login:      c.login,
          avatar_url: c.avatar_url,
        }))]
        if (data.length < 100) break
        page++
      }
    }

    const logins = users.map(c => c.login.toLowerCase())
    const registeredLogins = new Set<string>()

    if (logins.length > 0) {
      const chunks = []
      for (let i = 0; i < logins.length; i += 30) {
        chunks.push(logins.slice(i, i + 30))
      }
      await Promise.all(chunks.map(async chunk => {
        const usersSnap = await getDocs(
          query(collection(db, "users"), where("username", "in", chunk))
        )
        usersSnap.docs.forEach(d => {
          const username = d.data().username as string
          if (username) registeredLogins.add(username.toLowerCase())
        })
      }))
    }

    const result = users.map(c => ({
      ...c,
      isRegistered: registeredLogins.has(c.login.toLowerCase()),
    }))

    return NextResponse.json({ contributors: result })
  } catch {
    return NextResponse.json({ error: "Failed to fetch contributors" }, { status: 500 })
  }
}
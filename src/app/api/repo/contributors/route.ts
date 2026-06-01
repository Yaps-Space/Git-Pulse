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

  try {
    let contributors: { login: string; avatar_url: string }[] = []
    let page = 1
    while (true) {
      const res  = await fetch(
        `https://api.github.com/repos/${repoFullName}/contributors?per_page=100&page=${page}`,
        { headers: { Authorization: `Bearer ${session.accessToken}` } }
      )
      if (!res.ok) break
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) break
      contributors = [...contributors, ...data.map((c: { login: string; avatar_url: string }) => ({
        login:      c.login,
        avatar_url: c.avatar_url,
      }))]
      if (data.length < 100) break
      page++
    }

    const logins = contributors.map(c => c.login.toLowerCase())
    const registeredLogins = new Set<string>()

    if (logins.length > 0) {
      const usersSnap = await getDocs(
        query(collection(db, "users"), where("username", "in", logins.slice(0, 30)))
      )
      usersSnap.docs.forEach(d => {
        const username = d.data().username as string
        if (username) registeredLogins.add(username.toLowerCase())
      })
    }

    const result = contributors.map(c => ({
      ...c,
      isRegistered: registeredLogins.has(c.login.toLowerCase()),
    }))

    return NextResponse.json({ contributors: result })
  } catch {
    return NextResponse.json({ error: "Failed to fetch contributors" }, { status: 500 })
  }
}
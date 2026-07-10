import { db } from "@/shared/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"

interface GitLabTokenData {
  accessToken:  string
  refreshToken: string
  expiresAt:    number | null
  id:           string
  username:     string | null
}

export async function getValidGitLabToken(userId: string): Promise<string | null> {
  const userSnap = await getDoc(doc(db, "users", userId))
  if (!userSnap.exists()) return null

  const gitlab = userSnap.data().linkedProviders?.gitlab as GitLabTokenData | undefined
  if (!gitlab?.accessToken) return null

  const isExpired = gitlab.expiresAt
    ? Date.now() >= gitlab.expiresAt - 60_000
    : false

  if (!isExpired) return gitlab.accessToken

  if (!gitlab.refreshToken) return null

  try {
    const res = await fetch("https://gitlab.com/oauth/token", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type:    "refresh_token",
        refresh_token: gitlab.refreshToken,
        client_id:     process.env.GITLAB_ID!,
        client_secret: process.env.GITLAB_SECRET!,
        redirect_uri:  `${process.env.NEXTAUTH_URL}/api/auth/connect/gitlab/callback`,
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    if (!data.access_token) return null

    await setDoc(doc(db, "users", userId), {
      linkedProviders: {
        gitlab: {
          accessToken:  data.access_token,
          refreshToken: data.refresh_token ?? gitlab.refreshToken,
          expiresAt:    data.expires_in
            ? Date.now() + data.expires_in * 1000
            : null,
        }
      }
    }, { merge: true })

    return data.access_token
  } catch {
    return null
  }
}
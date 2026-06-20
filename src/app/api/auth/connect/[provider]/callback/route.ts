import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { db } from "@/shared/lib/firebase"
import { doc, setDoc } from "firebase/firestore"

const TOKEN_ENDPOINTS = {
  github: {
    tokenUrl:     "https://github.com/login/oauth/access_token",
    clientId:     process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!,
    redirectUri:  `${process.env.NEXTAUTH_URL}/api/auth/connect/github/callback`,
  },
  gitlab: {
    tokenUrl:     "https://gitlab.com/oauth/token",
    clientId:     process.env.GITLAB_ID!,
    clientSecret: process.env.GITLAB_SECRET!,
    redirectUri:  `${process.env.NEXTAUTH_URL}/api/auth/connect/gitlab/callback`,
  },
}

const PROFILE_ENDPOINTS = {
  github: "https://api.github.com/user",
  gitlab: "https://gitlab.com/api/v4/user",
}

async function exchangeCodeForToken(
  provider: keyof typeof TOKEN_ENDPOINTS,
  code: string
): Promise<string | null> {
  const config = TOKEN_ENDPOINTS[provider]

  const res = await fetch(config.tokenUrl, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept":       "application/json",
    },
    body: JSON.stringify({
      client_id:     config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri:  config.redirectUri,
      ...(provider === "gitlab" ? { grant_type: "authorization_code" } : {}),
    }),
  })

  const data = await res.json()
  return data.access_token ?? null
}

async function getProviderProfile(
  provider: keyof typeof PROFILE_ENDPOINTS,
  accessToken: string
): Promise<{ id: string; username: string | null } | null> {
  const res = await fetch(PROFILE_ENDPOINTS[provider], {
    headers: {
      Authorization: provider === "github"
        ? `token ${accessToken}`
        : `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) return null
  const data = await res.json()

  return {
    id:       data.id?.toString(),
    username: data.login ?? data.username ?? null,
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: rawProvider } = await params
  const provider = rawProvider as keyof typeof TOKEN_ENDPOINTS
  const config   = TOKEN_ENDPOINTS[provider]

  if (!config) {
    return NextResponse.redirect(new URL("/account?error=invalid_provider", req.url))
  }

  const { searchParams } = new URL(req.url)
  const code             = searchParams.get("code")
  const state            = searchParams.get("state")
  const storedState      = req.cookies.get(`connect_oauth_state_${provider}`)?.value

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/account?error=invalid_state", req.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/account?error=no_code", req.url))
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    const accessToken = await exchangeCodeForToken(provider, code)
    if (!accessToken) {
      return NextResponse.redirect(new URL("/account?error=token_failed", req.url))
    }

    const profile = await getProviderProfile(provider, accessToken)
    if (!profile) {
      return NextResponse.redirect(new URL("/account?error=profile_failed", req.url))
    }

    await setDoc(doc(db, "users", session.user.id), {
      linkedProviders: {
        [provider]: {
          id:          profile.id,
          accessToken,
          username:    profile.username,
        }
      }
    }, { merge: true })

    const response = NextResponse.redirect(
      new URL(`/account?connected=${provider}`, req.url)
    )
    response.cookies.delete(`connect_oauth_state_${provider}`)
    return response

  } catch (e) {
    console.error("Connect callback error:", e)
    return NextResponse.redirect(new URL("/account?error=server_error", req.url))
  }
}
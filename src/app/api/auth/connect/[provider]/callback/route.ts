import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { db } from "@/shared/lib/firebase"
import { doc, setDoc, getDocs, query, where, collection } from "firebase/firestore"

const TOKEN_ENDPOINTS = {
  github: {
    tokenUrl:     "https://github.com/login/oauth/access_token",
    clientId:     process.env.GITHUB_CONNECT_ID!,
    clientSecret: process.env.GITHUB_CONNECT_SECRET!,
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

interface TokenResponse {
  access_token?:  string
  refresh_token?: string
  expires_in?:    number
}

interface ProviderProfile {
  id:       string
  username: string | null
  email:    string | null
}

async function exchangeCodeForToken(
  provider: keyof typeof TOKEN_ENDPOINTS,
  code: string
): Promise<TokenResponse | null> {
  const config = TOKEN_ENDPOINTS[provider]

  const res = await fetch(config.tokenUrl, {
    method:  "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      client_id:     config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri:  config.redirectUri,
      ...(provider === "gitlab" ? { grant_type: "authorization_code" } : {}),
    }),
  })

  const data = await res.json()
  if (!data.access_token) return null
  return data as TokenResponse
}

async function getProviderProfile(
  provider: keyof typeof PROFILE_ENDPOINTS,
  accessToken: string
): Promise<ProviderProfile | null> {
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
    email:    data.email ?? null,
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
  const code        = searchParams.get("code")
  const state       = searchParams.get("state")
  const storedState = req.cookies.get(`connect_oauth_state_${provider}`)?.value
  const returnTo    = req.cookies.get(`connect_return_to_${provider}`)?.value ?? "/account"

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL(`${new URL(returnTo, req.url).pathname}?error=invalid_state`, req.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL(`${new URL(returnTo, req.url).pathname}?error=no_code`, req.url))
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    const tokenData = await exchangeCodeForToken(provider, code)
    if (!tokenData?.access_token) {
      return NextResponse.redirect(new URL(`${new URL(returnTo, req.url).pathname}?error=token_failed`, req.url))
    }

    const profile = await getProviderProfile(provider, tokenData.access_token)
    if (!profile) {
      return NextResponse.redirect(new URL(`${new URL(returnTo, req.url).pathname}?error=profile_failed`, req.url))
    }

    const conflictSnap = await getDocs(
      query(
        collection(db, "users"),
        where(`linkedProviders.${provider}.id`, "==", profile.id)
      )
    )
    const conflict = conflictSnap.docs.find(d => d.id !== session.user.id)
    if (conflict) {
      return NextResponse.redirect(new URL(`${new URL(returnTo, req.url).pathname}?error=provider_taken`, req.url))
    }

    const providerData: Record<string, unknown> = {
      id:          profile.id,
      accessToken: tokenData.access_token,
      username:    profile.username,
      email:       profile.email,
    }

    if (provider === "gitlab" && tokenData.refresh_token) {
      providerData.refreshToken = tokenData.refresh_token
      providerData.expiresAt    = tokenData.expires_in
        ? Date.now() + tokenData.expires_in * 1000
        : null
    }

    await setDoc(doc(db, "users", session.user.id), {
      linkedProviders: { [provider]: providerData }
    }, { merge: true })

    const basePath = new URL(returnTo, req.url).pathname
    const response = NextResponse.redirect(
      new URL(`${basePath}?connected=${provider}`, req.url)
    )
    response.cookies.delete(`connect_oauth_state_${provider}`)
    response.cookies.delete(`connect_return_to_${provider}`)
    return response

  } catch (e) {
    console.error("Connect callback error:", e)
    return NextResponse.redirect(new URL(`${new URL(returnTo, req.url).pathname}?error=server_error`, req.url))
  }
}
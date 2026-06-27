import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { randomBytes } from "crypto"

const OAUTH_CONFIGS = {
  github: {
    authUrl:     "https://github.com/login/oauth/authorize",
    clientId:    process.env.GITHUB_ID!,
    scope:       "read:user user:email repo",
    redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/connect/github/callback`,
  },
  gitlab: {
    authUrl:     "https://gitlab.com/oauth/authorize",
    clientId:    process.env.GITLAB_ID!,
    scope:       "read_user read_api read_repository",
    redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/connect/gitlab/callback`,
  },
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const { provider: rawProvider } = await params
  const provider = rawProvider as keyof typeof OAUTH_CONFIGS
  const config   = OAUTH_CONFIGS[provider]

  if (!config) {
    return NextResponse.json({ error: "Provider tidak didukung." }, { status: 400 })
  }

  const state    = randomBytes(16).toString("hex")
  const returnTo = req.headers.get("referer") ?? "/account"

  const oauthUrl = new URL(config.authUrl)
  oauthUrl.searchParams.set("client_id",    config.clientId)
  oauthUrl.searchParams.set("redirect_uri", config.redirectUri)
  oauthUrl.searchParams.set("scope",        config.scope)
  oauthUrl.searchParams.set("state",        state)
  if (provider === "gitlab") {
    oauthUrl.searchParams.set("response_type", "code")
  }

  const response = NextResponse.redirect(oauthUrl.toString())

  response.cookies.set(`connect_oauth_state_${provider}`, state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    maxAge:   60 * 10,
    path:     "/",
    sameSite: "lax",
  })

  response.cookies.set(`connect_return_to_${provider}`, returnTo, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    maxAge:   60 * 10,
    path:     "/",
    sameSite: "lax",
  })

  return response
}
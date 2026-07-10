import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken:  string | null   // GitHub OAuth token
    gitlabToken:  string | null   // GitLab OAuth token
    user: {
      id:       string
      username: string | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken:  string | null
    gitlabToken:  string | null
    id?:          string
    username?:    string | null
  }
}
import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import type { NextAuthOptions, Session, User } from "next-auth"
import type { JWT } from "next-auth/jwt"
import type { Account, Profile } from "next-auth"
import { db } from "@/shared/lib/firebase"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId:     process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: { scope: "read:user user:email repo" }
      }
    })
  ],
  callbacks: {
    async signIn({ user, profile }: { user: User; account: Account | null; profile?: Profile }) {
      try {
        const githubProfile = profile as (Profile & { id?: number; login?: string }) | undefined
        const userId        = githubProfile?.id?.toString() || user.id
        const userRef       = doc(db, "users", userId)
        const userSnap      = await getDoc(userRef)

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            name:      user.name,
            email:     user.email,
            image:     user.image,
            username:  githubProfile?.login,
            createdAt: serverTimestamp(),
          })
        }
      } catch (e) {
        console.error("Failed to save user:", e)
      }
      return true
    },
    async jwt({ token, account, profile }: { token: JWT; account: Account | null; profile?: Profile }) {
      if (account) {
        const githubProfile = profile as (Profile & { id?: number; login?: string }) | undefined
        token.accessToken   = account.access_token
        token.id            = githubProfile?.id?.toString() || token.sub
        token.username      = githubProfile?.login
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken   = token.accessToken as string
      session.user.id       = (token.id ?? token.sub) as string
      session.user.username = token.username as string
      return session
    }
  },
  pages:  { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
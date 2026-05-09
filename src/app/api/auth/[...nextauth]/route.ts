import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import type { NextAuthOptions } from "next-auth"
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
    async signIn({ user, profile }: any) {
      try {
        const userId  = profile?.id?.toString() || user.id
        const userRef = doc(db, "users", userId)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            name:      user.name,
            email:     user.email,
            image:     user.image,
            username:  profile?.login,
            createdAt: serverTimestamp(),
          })
        }
      } catch (e) {
        console.error("Failed to save user:", e)
      }
      return true
    },
    async jwt({ token, account, profile }: any) {
      if (account) {
        token.accessToken = account.access_token
        token.id          = profile?.id?.toString() || token.sub
        token.username    = profile?.login
      }
      return token
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken
      session.user.id     = token.id || token.sub
      session.user.username  = token.username
      return session
    }
  },
  pages:  { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
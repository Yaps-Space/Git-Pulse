import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GitLabProvider from "next-auth/providers/gitlab"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import type { NextAuthOptions, Session, User } from "next-auth"
import type { JWT } from "next-auth/jwt"
import type { Account, Profile } from "next-auth"
import { db } from "@/shared/lib/firebase"
import {
  doc, getDoc, setDoc, serverTimestamp,
  collection, query, where, getDocs
} from "firebase/firestore"

async function findUserByLinkedProvider(provider: "github" | "gitlab", providerId: string) {
  const usersRef = collection(db, "users")
  const snap     = await getDocs(
    query(usersRef, where(`linkedProviders.${provider}.id`, "==", providerId))
  )
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId:     process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: { params: { scope: "read:user user:email repo" } }
    }),

    GitLabProvider({
      clientId:     process.env.GITLAB_ID!,
      clientSecret: process.env.GITLAB_SECRET!,
      authorization: { params: { scope: "read_user read_api read_repository" } }
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login:    { label: "Email atau Username", type: "text" },
        password: { label: "Password",            type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) return null

        try {
          const usersRef = collection(db, "users")

          let userSnap = await getDocs(
            query(usersRef, where("email", "==", credentials.login))
          )
          if (userSnap.empty) {
            userSnap = await getDocs(
              query(usersRef, where("username", "==", credentials.login))
            )
          }
          if (userSnap.empty) return null

          const userDoc  = userSnap.docs[0]
          const userData = userDoc.data()

          if (!userData.passwordHash) return null

          const isValid = await bcrypt.compare(credentials.password, userData.passwordHash)
          if (!isValid) return null

          return {
            id:       userDoc.id,
            name:     userData.name,
            email:    userData.email,
            image:    userData.image ?? null,
            username: userData.username,
          } as User & { username: string }
        } catch (e) {
          console.error("Credentials authorize error:", e)
          return null
        }
      }
    })
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.type === "credentials") return true

      try {
        const isGithub = account?.provider === "github"
        const isGitlab = account?.provider === "gitlab"

        const githubProfile = isGithub
          ? (profile as Profile & { id?: number; login?: string })
          : undefined
        const gitlabProfile = isGitlab
          ? (profile as Profile & { id?: number; username?: string })
          : undefined

        const providerId = githubProfile?.id?.toString()
          ?? gitlabProfile?.id?.toString()
          ?? user.id

        const provider = isGithub ? "github" : "gitlab"

        // Cek apakah provider ID ini sudah di-connect ke akun lain
        const existingUser = await findUserByLinkedProvider(provider, providerId)

        if (existingUser) {
          // Akun ditemukan — hanya update token, JANGAN tiban data utama
          await setDoc(doc(db, "users", existingUser.id), {
            linkedProviders: {
              [provider]: {
                id:          providerId,
                accessToken: account?.access_token ?? null,
                username:    githubProfile?.login ?? gitlabProfile?.username ?? null,
              }
            }
          }, { merge: true })

          user.id = existingUser.id
          return true
        }

        // Akun belum ada — buat baru dengan data dari provider
        const userRef  = doc(db, "users", providerId)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          // First-write: simpan data utama dari provider pertama
          await setDoc(userRef, {
            name:      user.name,
            email:     user.email,
            image:     user.image,
            username:  githubProfile?.login ?? gitlabProfile?.username ?? null,
            createdAt: serverTimestamp(),
            passwordHash:    null,
            linkedProviders: {
              [provider]: {
                id:          providerId,
                accessToken: account?.access_token ?? null,
                username:    githubProfile?.login ?? gitlabProfile?.username ?? null,
              }
            }
          })
        } else {
          // Dokumen sudah ada — hanya update token, data utama tetap
          await setDoc(userRef, {
            linkedProviders: {
              [provider]: {
                id:          providerId,
                accessToken: account?.access_token ?? null,
                username:    githubProfile?.login ?? gitlabProfile?.username ?? null,
              }
            }
          }, { merge: true })
        }
      } catch (e) {
        console.error("Failed to save user:", e)
      }

      return true
    },

    async jwt({ token, account, profile, user }) {
      if (account?.type === "credentials" && user) {
        const u           = user as User & { username?: string }
        token.id          = u.id
        token.username    = u.username ?? null
        token.accessToken = null
        token.gitlabToken = null
        return token
      }

      if (account && (account.provider === "github" || account.provider === "gitlab")) {
        const isGithub = account.provider === "github"
        const p        = profile as Profile & { id?: number; login?: string; username?: string }

        // Pakai user.id yang mungkin sudah di-override di signIn callback
        const userId = user?.id ?? p?.id?.toString() ?? token.sub

        // Ambil data utama dari Firestore — bukan dari profile provider
        try {
          const snap     = await getDoc(doc(db, "users", userId!))
          const userData = snap.exists() ? snap.data() : null

          token.id       = userId
          token.name     = userData?.name     ?? user.name
          token.email    = userData?.email    ?? user.email
          token.picture  = userData?.image    ?? user.image
          token.username = userData?.username ?? p?.login ?? p?.username ?? null
        } catch {
          token.id       = userId
          token.username = p?.login ?? p?.username ?? null
        }

        if (isGithub) {
          token.accessToken = account.access_token ?? null
          token.gitlabToken = null
        } else {
          token.gitlabToken = account.access_token ?? null
          token.accessToken = null
        }
      }

      return token
    },

    async session({ session, token }) {
      session.accessToken   = (token.accessToken as string | null) ?? null
      session.gitlabToken   = (token.gitlabToken as string | null) ?? null
      session.user.id       = (token.id ?? token.sub) as string
      session.user.name     = (token.name     as string | null) ?? session.user.name
      session.user.email    = (token.email    as string | null) ?? session.user.email
      session.user.image    = (token.picture  as string | null) ?? session.user.image
      session.user.username = (token.username as string | null) ?? null
      return session
    }
  },

  pages:  { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
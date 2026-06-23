import { db } from "@/shared/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export async function getProviderTokens(userId: string) {
  try {
    const snap = await getDoc(doc(db, "users", userId))
    if (!snap.exists()) return { githubToken: null, gitlabToken: null }
    const data = snap.data()
    return {
      githubToken: (data.linkedProviders?.github?.accessToken as string) ?? null,
      gitlabToken: (data.linkedProviders?.gitlab?.accessToken as string) ?? null,
    }
  } catch {
    return { githubToken: null, gitlabToken: null }
  }
}
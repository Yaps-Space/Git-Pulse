import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { doc, setDoc } from "firebase/firestore"

// Endpoint ini dipanggil setelah OAuth connect selesai.
// Flow: user sudah login → klik "Connect GitHub/GitLab" →
// OAuth jalan → callback bawa token → POST ke sini → simpan ke Firestore.

export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string } | Promise<{ provider: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { provider } = await params

  if (provider !== "github" && provider !== "gitlab") {
    return NextResponse.json({ error: "Provider tidak didukung." }, { status: 400 })
  }

  try {
    const body = await req.json()
    const { accessToken, providerUserId, username } = body

    if (!accessToken || !providerUserId) {
      return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 })
    }

    const userRef = doc(db, "users", session.user.id)

    await setDoc(userRef, {
      linkedProviders: {
        [provider]: {
          id:          providerUserId,
          accessToken,
          username:    username ?? null,
        }
      }
    }, { merge: true })

    return NextResponse.json({ message: `${provider} berhasil dihubungkan.` })
  } catch (e) {
    console.error("Connect provider error:", e)
    return NextResponse.json({ error: "Gagal menyimpan koneksi." }, { status: 500 })
  }
}
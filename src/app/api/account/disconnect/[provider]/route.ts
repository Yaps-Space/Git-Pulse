import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { doc, updateDoc, deleteField } from "firebase/firestore"

const VALID_PROVIDERS = ["github", "gitlab"] as const
type Provider = typeof VALID_PROVIDERS[number]

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { provider: rawProvider } = await params
  if (!VALID_PROVIDERS.includes(rawProvider as Provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
  }
  const provider = rawProvider as Provider

  try {
    await updateDoc(doc(db, "users", session.user.id), {
      [`linkedProviders.${provider}`]: deleteField(),
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Disconnect provider error:", e)
    return NextResponse.json({ error: "Gagal memutuskan koneksi." }, { status: 500 })
  }
}
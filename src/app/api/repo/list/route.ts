import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const snap  = await getDocs(query(collection(db, "repositories"), where("userId", "==", session.user.id)))
    const repos = snap.docs.map(doc => {
      const data = doc.data()
      return {
        id:                doc.id,
        fullName:          data.fullName          ?? "",
        productivityState: data.productivityState ?? "-",
        healthScore:       data.healthScore       ?? 0,
        healthGrade:       data.healthGrade       ?? "-",
        analyzedAt:        data.analyzedAt?.seconds ? data.analyzedAt.seconds * 1000 : null,
        isPrivate:         data.isPrivate         ?? false,
        provider:          (data.provider         as "github" | "gitlab") ?? "github",
      }
    })
    return NextResponse.json({ repos })
  } catch {
    return NextResponse.json({ repos: [] })
  }
}
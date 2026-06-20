import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import bcrypt from "bcryptjs"

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, currentPassword, newPassword } = body

    const userRef  = doc(db, "users", session.user.id)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 })
    }

    const userData  = userSnap.data()
    const updateData: Record<string, unknown> = {}

    // Update nama
    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ error: "Nama tidak boleh kosong." }, { status: 400 })
      }
      updateData.name = name.trim()
    }

    // Update password
    if (newPassword !== undefined) {
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "Password baru minimal 8 karakter." }, { status: 400 })
      }

      // Kalau user sudah punya password → wajib verifikasi password lama
      if (userData.passwordHash) {
        if (!currentPassword) {
          return NextResponse.json({ error: "Password saat ini wajib diisi." }, { status: 400 })
        }
        const isValid = await bcrypt.compare(currentPassword, userData.passwordHash)
        if (!isValid) {
          return NextResponse.json({ error: "Password saat ini salah." }, { status: 400 })
        }
      }
      // Kalau OAuth user (belum punya password) → langsung set tanpa verifikasi

      updateData.passwordHash = await bcrypt.hash(newPassword, 12)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Tidak ada yang diubah." }, { status: 400 })
    }

    await updateDoc(userRef, updateData)

    return NextResponse.json({ message: "Berhasil diperbarui." })
  } catch (e) {
    console.error("Update account error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 })
  }
}
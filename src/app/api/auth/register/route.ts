import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { randomUUID } from "crypto"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullName, email, username, password, confirmPassword } = body

    // Validasi field wajib
    if (!fullName || !email || !username || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Semua field wajib diisi." },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Password dan konfirmasi password tidak sama." },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter." },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      )
    }

    const usersRef = collection(db, "users")

    // Cek email sudah terdaftar
    const emailSnap = await getDocs(query(usersRef, where("email", "==", email)))
    if (!emailSnap.empty) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 409 }
      )
    }

    // Cek username sudah dipakai
    const usernameSnap = await getDocs(query(usersRef, where("username", "==", username)))
    if (!usernameSnap.empty) {
      return NextResponse.json(
        { error: "Username sudah dipakai." },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const uid          = randomUUID()

    await setDoc(doc(db, "users", uid), {
      name:            fullName,
      email,
      username,
      image:           null,
      passwordHash,
      createdAt:       serverTimestamp(),
      linkedProviders: {},
    })

    return NextResponse.json(
      { message: "Akun berhasil dibuat." },
      { status: 201 }
    )
  } catch (e) {
    console.error("Register error:", e)
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    )
  }
}
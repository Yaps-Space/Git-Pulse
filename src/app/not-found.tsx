import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "#F4F6F9" }}>
      <div className="text-center">
        <p className="text-8xl mb-4">🔍</p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#1E3A5F" }}>404</h1>
        <p className="text-lg mb-6" style={{ color: "#888" }}>Halaman tidak ditemukan</p>
        <Link href="/dashboard"
          className="px-6 py-3 rounded-xl text-white font-medium"
          style={{ background: "#2E86C1" }}>
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )
}
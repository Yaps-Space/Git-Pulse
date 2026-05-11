import Link from "next/link"
import { SearchX, ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EBEBEB]">
      <div className="text-center flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-sm">
          <SearchX className="w-10 h-10 text-gray-300" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900">404</h1>
          <p className="text-gray-400">Halaman tidak ditemukan</p>
        </div>
        <Button asChild variant="outline" className="gap-2 mt-2">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}
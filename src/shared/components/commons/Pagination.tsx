import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/shared/lib/utils"

interface PaginationProps {
  page:       number
  totalPages: number
  onChange:   (page: number) => void
  className?: string
  variant?:   "default" | "mobile"
}

export function Pagination({ page, totalPages, onChange, className, variant = "default" }: PaginationProps) {
  if (totalPages <= 1) return null

  if (variant === "mobile") {
    return (
      <div className={cn("flex items-center justify-between px-1 pt-3 pb-0", className)}>
        <span className="text-sm text-gray-400">Item {((page - 1) * 10) + 1} to {Math.min(page * 10, totalPages * 10)}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-700 min-w-[40px] text-center">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => onChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  const getPages = () => {
    const pages: (number | "...")[] = []
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    pages.push(1)
    if (page > 3) pages.push("...")
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push("...")
    pages.push(totalPages)
    return pages
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="text-gray-400 text-sm">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
              page === p
                ? "bg-[#000000] text-white"
                : "text-gray-500 hover:bg-gray-100"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
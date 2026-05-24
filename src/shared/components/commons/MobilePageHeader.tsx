"use client"

import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { ReactNode } from "react"

interface MobilePageHeaderProps {
  title:     string
  children?: ReactNode
  backHref?: string
}

export function MobilePageHeader({ title, children, backHref }: MobilePageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) router.push(backHref)
    else router.back()
  }

  return (
    <div className="bg-gray-900 px-5 pt-4 pb-6 rounded-b-3xl">
      {backHref !== undefined ? (
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-gray-400 font-bold mb-4 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {title}
        </button>
      ) : (
        <p className="text-gray-400 font-bold mb-4">{title}</p>
      )}
      {children}
    </div>
  )
}
"use client"

import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { ReactNode } from "react"

interface MobilePageHeaderProps {
  title:     ReactNode
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
        <div className="flex items-start gap-2 mb-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <p className="text-gray-400 font-bold text-md leading-snug">
            {title}
          </p>
        </div>
      ) : (
        <p className="text-gray-400 font-bold mb-4">{title}</p>
      )}
      {children}
    </div>
  )
}
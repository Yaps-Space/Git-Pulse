'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

type PageShellProps = {
  title: string
  tabs?: ReactNode
  detail?: ReactNode
  oneBack?: () => void
  children: ReactNode
}

export function PageShell({ title, tabs, detail, oneBack, children }: PageShellProps) {
  const router = useRouter()

  const handleBack = () => {
    if (oneBack) {
      oneBack()
    } else {
      router.back()
    }
  }

  return (
    <section className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 border-b border-black/8 bg-[#EBEBEB] px-8 flex flex-col justify-center" style={{ minHeight: detail ? '5.5rem' : '4.6rem' }}>
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-gray-900 xl:text-xl">{title}</h1>
            {tabs && (
              <span className="hidden items-center gap-2 text-lg font-semibold tracking-tight text-gray-500 sm:flex xl:text-xl">
                <span className="font-bold">-</span>
                {tabs}
              </span>
            )}
            {detail && (
              <span className="hidden items-center gap-2 text-lg font-semibold tracking-tight text-gray-500 sm:flex xl:text-xl">
                <ChevronRight className="w-4 h-4" />
                {detail}
              </span>
            )}
          </div>
          {detail && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors sm:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
              {detail}
            </button>
          )}
        </header>
      </div>
      <div className="flex flex-col gap-4 p-8">{children}</div>
    </section>
  )
}
'use client'

import { ChevronRight } from 'lucide-react'
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
    if (oneBack) oneBack()
    else router.back()
  }

  return (
    <section className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 border-b border-black/8 bg-[#EBEBEB] px-8 flex flex-col justify-center" style={{ minHeight: '4.6rem' }}>
        <header className="flex items-center gap-2">
          {detail ? (
            <button
              type="button"
              onClick={handleBack}
              className="text-lg font-semibold tracking-tight text-gray-900 hover:underline underline-offset-2 transition-all xl:text-xl"
            >
              {title}
            </button>
          ) : (
            <h1 className="text-lg font-semibold tracking-tight text-gray-900 xl:text-xl">{title}</h1>
          )}

          {tabs && (
            <span className="flex items-center gap-2 text-lg font-semibold tracking-tight text-gray-500 xl:text-xl">
              <span className="font-bold">-</span>
              {tabs}
            </span>
          )}

          {detail && (
            <span className="flex items-center gap-2 text-lg font-semibold tracking-tight text-gray-900 xl:text-xl">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {detail}
            </span>
          )}
        </header>
      </div>
      <div className="flex flex-col gap-4 p-8">{children}</div>
    </section>
  )
}
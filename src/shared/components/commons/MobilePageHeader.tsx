import { ReactNode } from "react"

interface MobilePageHeaderProps {
  title:    string
  children?: ReactNode
}

export function MobilePageHeader({ title, children }: MobilePageHeaderProps) {
  return (
    <div className="bg-gray-900 px-5 pt-4 pb-6 rounded-b-3xl">
      <p className="text-gray-400 font-bold mb-4">{title}</p>
      {children}
    </div>
  )
}
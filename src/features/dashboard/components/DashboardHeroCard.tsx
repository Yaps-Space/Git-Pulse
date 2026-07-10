"use client"

import { GitHubIcon, GitLabIcon } from "@/shared/components/commons/ProviderIcons"

interface Props {
  name: string
}

export function DashboardHeroCard({ name }: Props) {
  return (
    <div className="rounded-2xl bg-[#00D964] p-6 flex items-center justify-between">
      <div>
        <p className="text-gray-900 font-medium mb-1">Hello, {name}!</p>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-800 text-sm">Pantau ringkasan kinerja repository kamu di sini</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <GitHubIcon className="w-14 h-14 text-gray-900 opacity-80" />
        <GitLabIcon className="w-14 h-14 text-gray-900 opacity-80" />
      </div>
    </div>
  )
}
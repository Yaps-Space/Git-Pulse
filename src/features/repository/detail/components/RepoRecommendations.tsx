"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

interface Props {
  recommendations: string[]
  refreshing?:     boolean
}

export function RepoRecommendations({ recommendations, refreshing }: Props) {
  if (recommendations.length === 0) return null

  return (
    <Card className="relative overflow-hidden bg-gray-900 border-gray-900">
      {refreshing && (
        <div className="absolute inset-0 z-10 bg-gray-900/70 flex items-center justify-center rounded-xl">
          <div className="w-6 h-6 rounded-full border-2 border-gray-700 border-t-[#00D964] animate-spin" />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-white text-base">Rekomendasi</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D964] flex-shrink-0 mt-1.5" />
              {rec}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
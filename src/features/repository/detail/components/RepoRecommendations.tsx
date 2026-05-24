"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

interface Props {
  recommendations: string[]
}

export function RepoRecommendations({ recommendations }: Props) {
  if (recommendations.length === 0) return null

  return (
    <Card className="bg-gray-900 border-gray-900">
      <CardHeader className="">
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
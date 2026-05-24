"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { RepoDetail } from "../types/RepoDetail"
import { GRADE_COLOR } from "../../constants"
import { HEALTH_BREAKDOWN_ITEMS } from "../constants/HealthCard"

interface Props {
  repo: RepoDetail
}

export function RepoHealthCard({ repo }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold">Health Score</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold" style={{ color: GRADE_COLOR[repo.healthGrade] ?? "#888" }}>
            {repo.healthScore}
          </span>
          <span className="text-2xl font-bold" style={{ color: GRADE_COLOR[repo.healthGrade] ?? "#888" }}>
            {repo.healthGrade}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {HEALTH_BREAKDOWN_ITEMS(repo).map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-800">{item.label}</span>
                <span className="text-xs font-semibold text-gray-700">{item.value}/{item.max}</span>
              </div>
              <div className="w-full rounded-full h-1.5 bg-gray-100">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width:      `${(item.value / item.max) * 100}%`,
                    background: item.value / item.max >= 0.7 ? "#3FB950"
                      : item.value / item.max >= 0.4 ? "#F9C74F" : "#F85149",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
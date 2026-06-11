export interface HealthBreakdownItem {
  score:        number
  weight:       number
  contribution: number
  details:      Record<string, unknown>
  missing:      string[]
}

export interface RepoDetail {
  id:                    string
  fullName:              string
  description:           string | null
  language:              string | null
  stars:                 number
  forks:                 number
  isPrivate:             boolean
  productivityState:     string
  commitFrequency:       number
  activityConsistency:   number
  commitTrend:           number
  activeDaysRatio:       number
  productivityRec:       string | null
  healthScore:           number
  healthGrade:           string
  healthLabel:           string
  healthBreakdown:       Record<string, HealthBreakdownItem>  // ← diubah
  healthRecommendations: string[]
  analyzedAt:            number | null
}
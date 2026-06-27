export interface DashboardRepo {
  id:                string
  fullName:          string
  provider:          string
  productivityState: string
  healthScore:       number
  healthGrade:       string
  language:          string | null
  stars:             number
  forks:             number
  analyzedAt:        number | null
  commitFrequency:   number
  activeDaysRatio:   number
  commitTrend:       number
  additionsPercent:  number
  deletionsPercent:  number
  commitsPerMonth:   number[]
  prPerMonth:        number[]
  issuesPerMonth:    number[]
  isPrivate:         boolean
}
export interface DashboardRepo {
  id:                string
  fullName:          string
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
}

// export interface DashboardStats {
//   totalRepos:   number
//   activeRepos:  number
//   totalTeams:   number
//   avgHealth:    number
// }
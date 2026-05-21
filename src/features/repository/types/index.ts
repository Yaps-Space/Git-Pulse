export interface Repo {
  id:                string
  fullName:          string
  productivityState: string
  healthScore:       number
  healthGrade:       string
  analyzedAt:        number | null
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
  healthBreakdown:       Record<string, number>
  healthRecommendations: string[]
  analyzedAt:            number | null
}

export interface GithubRepo {
  id:               number
  full_name:        string
  name:             string
  owner:            { login: string; avatar_url: string }
  description:      string | null
  language:         string | null
  stargazers_count: number
  forks_count:      number
  pushed_at:        string
  private:          boolean
}

export type SortKey = "fullName" | "healthScore" | "healthGrade" | "analyzedAt"
export type SortDir = "asc" | "desc"
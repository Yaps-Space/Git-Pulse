export interface Repo {
  id:                string
  fullName:          string
  productivityState: string
  healthScore:       number
  healthGrade:       string
  analyzedAt:        number | null
  provider?:         "github" | "gitlab"
}

export type SortKey = "fullName" | "healthScore" | "healthGrade" | "analyzedAt"
export type SortDir = "asc" | "desc"

export interface GithubRepo {
  id:               number
  full_name:        string
  description:      string | null
  private:          boolean
  language:         string | null
  stargazers_count: number
  forks_count:      number
  pushed_at:        string | null
  owner: {
    avatar_url: string | null
    login:      string
  }
}

export type Provider = "github" | "gitlab"
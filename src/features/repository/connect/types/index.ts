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
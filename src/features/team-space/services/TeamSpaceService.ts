interface Repo {
  id:       string
  fullName: string
}

interface CreateTeamSpaceData {
  name:          string
  description:   string
  repoFullNames: string[]
  importLogins:  string[]
}

export async function createTeamSpace(data: CreateTeamSpaceData) {
  const res = await fetch("/api/team-space", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  })
  return res.json()
}

export async function joinTeamSpace(inviteCode: string) {
  const res = await fetch("/api/team-space/join", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ inviteCode }),
  })
  return res.json()
}

export async function fetchRepos(): Promise<Repo[]> {
  const res = await fetch("/api/repo/list")
  const data = await res.json()
  return data.repos ?? []
}

export interface Contributor {
  login:        string
  avatar_url:   string
  isRegistered: boolean
}

export async function fetchRepoContributors(repoFullName: string): Promise<Contributor[]> {
  const res  = await fetch(`/api/repo/contributors?repo=${encodeURIComponent(repoFullName)}`)
  const data = await res.json()
  return data.contributors ?? []
}
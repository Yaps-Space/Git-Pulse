interface Repo {
  id:       string;
  fullName: string;
}

interface CreateTeamSpaceData {
  name:        string;
  description: string;
  repoFullName: string;
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
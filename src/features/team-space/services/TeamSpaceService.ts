interface Repo {
  id:       string
  fullName: string
  provider: "github" | "gitlab"
}

interface ImportMember {
  login:       string
  displayName: string
}

interface CreateTeamSpaceData {
  name:           string
  description:    string
  repoFullNames:  string[]
  academicYearId: string | null
  studyProgramId: string | null
  projectManager: string | null
  importMembers:  ImportMember[]
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

interface UpdateTeamSpacePayload {
  name:           string
  description:    string | null
  projectManager: string | null
  academicYearId: string | null
  studyProgramId: string | null
}

export async function updateTeamSpace(id: string, payload: UpdateTeamSpacePayload) {
  const res = await fetch(`/api/team-space/${id}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  })
  return res.json()
}

export async function fetchRepos(): Promise<Repo[]> {
  const res  = await fetch("/api/repo/list")
  const data = await res.json()
  return (data.repos ?? []) as Repo[]
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
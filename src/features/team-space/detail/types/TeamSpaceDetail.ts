import { TeamMember } from "../../types/TeamSpace"

export interface RepoHealth {
  repoFullName:      string
  repoId:            string | null
  healthScore:       number
  healthGrade:       string
  productivityState: string
}

export interface TeamSpaceDetail {
  id:          string
  name:        string
  description: string | null
  repoFullNames: string[]
  ownerId:     string
  inviteCode:  string
  createdAt:   number | null
  myRole:      string
  myMembership: TeamMember
  members:     TeamMember[]
  /**
   * Commit count per month for each repository over the last 12 months.
   * Key: repoFullName (e.g. "owner/repo"), Value: array of 12 monthly counts.
   */
  repoCommitsPerMonth: Record<string, number[]>
  repoHealthList: RepoHealth[]
}
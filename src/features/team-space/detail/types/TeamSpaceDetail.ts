import { TeamMember } from "../../types/TeamSpace"

export interface RepoHealth {
  repoFullName:      string
  repoId:            string | null
  healthScore:       number
  healthGrade:       string
  productivityState: string
}

export interface TeamSpaceDetail {
  id:                  string
  name:                string
  description:         string | null
  repoFullNames:       string[]
  ownerId:             string
  inviteCode:          string
  createdAt:           number | null
  myRole:              string
  myMembership:        TeamMember
  members:             TeamMember[]
  academicYear:        string | null
  studyProgram:        string | null
  projectManager:      string | null
  repoCommitsPerMonth: Record<string, number[]>
  repoHealthList:      RepoHealth[]
}
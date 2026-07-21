import { TeamMember } from "../../types/TeamSpace"

export interface RepoHealth {
  repoFullName:      string
  repoId:            string | null
  viewerRepoId:      string | null
  healthScore:       number
  healthGrade:       string
  productivityState: string
  provider:          "github" | "gitlab"
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
  academicYearId:      string | null
  studyProgramId:      string | null
  projectManager:      string | null
  repoCommitsPerMonth: Record<string, number[]>
  repoHealthList:      RepoHealth[]
}
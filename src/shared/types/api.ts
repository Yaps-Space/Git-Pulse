export interface Membership {
  id:      string;
  classId: string;
  role:    string;
}

export interface TeamResult {
  id:               string
  name:             string
  description:      string | null
  repoName:         string
  role:             string
  memberCount:      number
  healthScore:      number
  healthGrade:      string
  productivityState: string
}
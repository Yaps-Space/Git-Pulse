export interface Membership {
  id:      string;
  classId: string;
  role:    string;
}

export interface TeamResult {
  id:               string
  name:             string
  description:      string | null
  repoNames:        string[]
  role:             string
  memberCount:      number
  avgHealthScore:   number
  avgHealthGrade:   string
  productivityStates: string[]
}
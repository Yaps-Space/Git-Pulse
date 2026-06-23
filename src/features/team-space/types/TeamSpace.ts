export interface TeamSpace {
  id:                 string
  name:               string
  description:        string | null
  repoNames:          string[]
  role:               string
  memberCount:        number
  avgHealthScore:     number
  avgHealthGrade:     string
  academicYear:       string | null
  studyProgram:       string | null
  projectManager:     string | null
}

export interface TeamMember {
  id:                    string
  userId:                string | null
  userName:              string
  displayName:           string | null
  userLogin:             string | null
  userImage:             string | null
  role:                  string
  status:                string
  commitVelocity:        number
  contributionShare:     number
  activityConsistency:   number
  activeWeeksRatio:      number
  commitsPerMonth:       number[]
  commitsPerMonthByRepo: Record<string, number[]>
  recommendation:        string | null
  joinedAt:              number | null
  isOutsider:            boolean
}
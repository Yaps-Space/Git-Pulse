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
  commitVelocityByRepo:        Record<string, number>
  contributionShareByRepo:     Record<string, number>
  activityConsistencyByRepo:   Record<string, number>
  activeWeeksRatioByRepo:      Record<string, number>
  statusByRepo:                Record<string, string>
  recommendationByRepo:        Record<string, string>
  recommendation:        string | null
  joinedAt:              number | null
  isOutsider:            boolean
}
export interface TeamSpace {
  id:                  string
  name:                string
  description:         string | null
  repoNames:           string[]
  role:                string
  memberCount:         number
  avgHealthScore:      number
  avgHealthGrade:      string
  productivityStates:  string[]
}

export interface TeamMember {
  id:                  string
  userId:              string
  userName:            string
  userImage:           string
  role:                string
  status:              string
  commitVelocity:      number
  contributionShare:   number
  activityConsistency: number
  activeWeeksRatio:    number
  commitsPerMonth:     number[]
  recommendation:      string | null
  joinedAt:            number | null
}
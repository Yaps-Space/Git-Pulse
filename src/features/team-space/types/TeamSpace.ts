export interface TeamSpace {
  id:          string;
  name:        string;
  description: string | null;
  role:        string;
  memberCount: number;
  repoName:    string | null;
  createdAt:   number | null;
}

export interface TeamMember {
  id:                  string;
  userId:              string;
  userName:            string;
  userImage:           string;
  role:                string;
  status:              string;
  commitVelocity:      number;
  contributionShare:   number;
  activityConsistency: number;
  activeWeeksRatio:    number;
  recommendation:      string | null;
  joinedAt:            number | null;
}
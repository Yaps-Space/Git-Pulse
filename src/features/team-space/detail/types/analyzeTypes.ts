export interface GithubCommit {
  author:  { login?: string } | null
  commit:  {
    author: {
      email?: string
      name?:  string
      date?:  string
    }
  }
}

export interface MembershipDoc {
  membershipId: string
  userName:     string
  userLogin?:   string
  [key: string]: unknown
}

export interface MlPredictResponse {
  memberStatus:   string
  recommendation: string
}
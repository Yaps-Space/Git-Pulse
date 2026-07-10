export interface LinkedProvider {
  id:          string
  accessToken: string | null
  username:    string | null
}

export interface AccountData {
  name:        string
  username:    string
  email:       string
  avatar:      string
  createdAt:   string
  hasPassword: boolean
  linkedProviders: {
    github?: LinkedProvider
    gitlab?: LinkedProvider
  }
  onNameChange?: (name: string) => void
}
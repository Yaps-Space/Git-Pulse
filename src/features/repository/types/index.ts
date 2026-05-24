export interface Repo {
  id:                string
  fullName:          string
  productivityState: string
  healthScore:       number
  healthGrade:       string
  analyzedAt:        number | null
}

export type SortKey = "fullName" | "healthScore" | "healthGrade" | "analyzedAt"
export type SortDir = "asc" | "desc"
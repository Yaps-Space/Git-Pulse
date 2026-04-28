export const ROLE_COLOR: Record<string, string> = {
  owner:       "#6265FE",
  evaluator:   "#B6BBFF",
  contributor: "#BEF3DF",
}

export const ROLE_TEXT: Record<string, string> = {
  owner:       "#000000",
  evaluator:   "#000000",
  contributor: "#000000",
}

export const ROLE_LABEL: Record<string, string> = {
  owner:       "Owner",
  evaluator:   "Evaluator",
  contributor: "Contributor",
}

export const STATUS_COLOR: Record<string, string> = {
  Active:   "#3FB950",
  Passive:  "#F9C74F",
  Inactive: "#F85149",
  pending:  "#888888",
}

export const STATUS_LABEL: Record<string, string> = {
  Active:   "Active",
  Passive:  "Passive",
  Inactive: "Inactive",
  pending:  "Belum Dianalisis",
}

export const CONSISTENCY_LABEL = (value: number): string => {
  if (value <= 1.5) return "Sangat Stabil"
  if (value <= 3)   return "Stabil"
  return "Tidak Stabil"
}
export const STATUS_COLOR: Record<string, string> = {
  Active:    "#3FB950",
  Passive:   "#F9C74F",
  Inactive:  "#F85149",
  pending:   "#888888",
  analyzing: "#6265FE",
}

export const STATUS_LABEL: Record<string, string> = {
  Active:    "Active",
  Passive:   "Passive",
  Inactive:  "Inactive",
  pending:   "Belum Dianalisis",
  analyzing: "Sedang Dianalisis",
}

export const STATUS_STATS_CONFIG = [
  { key: "Active",   label: "Active",   description: "Total account aktif"       },
  { key: "Passive",  label: "Passive",  description: "Total account pasif"       },
  { key: "Inactive", label: "Inactive", description: "Total account tidak aktif" },
]

export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

export function getLastNMonthLabels(n: number): string[] {
  const now    = new Date()
  const result = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push(MONTH_NAMES[d.getMonth()])
  }
  return result
}

export const CONSISTENCY_LABEL = (value: number): string => {
  if (value <= 1.5) return "Sangat Stabil"
  if (value <= 3)   return "Stabil"
  return "Tidak Stabil"
}

export const getContributionItems = (membership: {
  commitVelocity:      number
  contributionShare:   number
  activityConsistency: number
  activeWeeksRatio:    number
}) => [
  { label: "Commit Velocity",    value: `${membership.commitVelocity.toFixed(1)}/hari`        },
  { label: "Contribution Share", value: `${(membership.contributionShare * 100).toFixed(1)}%` },
  { label: "Consistency",        value: CONSISTENCY_LABEL(membership.activityConsistency)     },
  { label: "Active Weeks",       value: `${Math.round(membership.activeWeeksRatio * 100)}%`   },
]
export const STATUS_COLOR: Record<string, string> = {
  Active:    "#00D964",
  Moderate:   "#FFDF61",
  Inactive:  "#FF9898",
  Pending:   "#EBEBEB",
  Analyzing: "#B6BBFF",
}

export const STATUS_LABEL: Record<string, string> = {
  Active:    "Active",
  Moderate:   "Moderate",
  Inactive:  "Inactive",
  Pending:   "Belum Dianalisis",
  Analyzing: "Sedang Dianalisis",
}

export const STATUS_STATS_CONFIG = [
  { key: "Active",   label: "Active",   description: "Total account aktif",       keys: ["Active",   "ACTIVE"]   },
  { key: "Moderate",  label: "Moderate",  description: "Total account moderate",       keys: ["Moderate",  "MODERATE"] },
  { key: "Inactive", label: "Inactive", description: "Total account tidak aktif", keys: ["Inactive", "INACTIVE"] },
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
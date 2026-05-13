import { type ChartConfig } from "@/shared/components/ui/chart"

export const activityChartConfig = {
  commits: {
    label: "Commits",
    color: "#00D964",
  },
} satisfies ChartConfig

export const workflowChartConfig = {
  commits: {
    label:  "Commits",
    color:  "#00D964",
  },
  active_weeks: {
    label:  "Active Weeks",
    color:  "#FFDF61",
  },
} satisfies ChartConfig
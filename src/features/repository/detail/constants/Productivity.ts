import { RepoDetail } from "../types/RepoDetail";

export const PRODUCTIVITY_ITEMS = (repo: RepoDetail) => [
  { label: "Commit Frequency",     value: `${repo.commitFrequency}/minggu`                                                                              },
  { label: "Activity Consistency", value: repo.activityConsistency <= 1.5 ? "Sangat Stabil" : repo.activityConsistency <= 3 ? "Stabil" : "Tidak Stabil" },
  { label: "Active Weeks Ratio",   value: `${Math.round(repo.activeDaysRatio * 100)}%`                                                                  },
]
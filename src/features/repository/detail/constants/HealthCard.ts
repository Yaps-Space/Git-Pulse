import { RepoDetail } from "../types/RepoDetail";

export const HEALTH_BREAKDOWN_ITEMS = (repo: RepoDetail) => [
  {
    label: "Community & Docs",
    value: repo.healthBreakdown?.community?.contribution        ?? 0,
    max:   30,
  },
  {
    label: "Popularitas",
    value: repo.healthBreakdown?.popularity?.contribution       ?? 0,
    max:   25,
  },
  {
    label: "Issue Management",
    value: repo.healthBreakdown?.issueManagement?.contribution  ?? 0,
    max:   25,
  },
  {
    label: "Velocity / Konsistensi",
    value: repo.healthBreakdown?.velocity?.contribution         ?? 0,
    max:   20,
  },
]
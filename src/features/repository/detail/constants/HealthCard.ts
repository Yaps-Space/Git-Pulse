import { RepoDetail } from "../types/RepoDetail";

export const HEALTH_BREAKDOWN_ITEMS = (repo: RepoDetail) => [
  { label: "Dokumentasi & Community", value: repo.healthBreakdown?.community_score  ?? 0, max: 100 },
  { label: "Popularitas",             value: repo.healthBreakdown?.popularity_score ?? 0, max: 100 },
  { label: "Issue Management",        value: repo.healthBreakdown?.issue_score      ?? 0, max: 100 },
  { label: "Velocity Stability",      value: repo.healthBreakdown?.velocity_score   ?? 0, max: 100 },
]
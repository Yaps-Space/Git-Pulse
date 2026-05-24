import { RepoDetail } from "../types/RepoDetail";

export const HEALTH_BREAKDOWN_ITEMS = (repo: RepoDetail) => [
  { label: "Dokumentasi",      value: repo.healthBreakdown?.dokumentasi     ?? 0, max: 15 },
  { label: "Issue Management", value: repo.healthBreakdown?.issueManagement ?? 0, max: 20 },
  { label: "Commit Activity",  value: repo.healthBreakdown?.commitActivity  ?? 0, max: 25 },
  { label: "Konsistensi",      value: repo.healthBreakdown?.konsistensi     ?? 0, max: 20 },
  { label: "Popularitas",      value: repo.healthBreakdown?.popularitas     ?? 0, max: 10 },
  { label: "Recency",          value: repo.healthBreakdown?.recency         ?? 0, max: 10 },
]
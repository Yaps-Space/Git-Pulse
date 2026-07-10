export const BREAKDOWN_CONFIG = {
  community: {
    label:    "Community & Docs",
    detailKeys: [
      { key: "has_readme",       label: "README" },
      { key: "has_license",      label: "License" },
      { key: "has_contributing", label: "CONTRIBUTING.md" },
      { key: "has_description",  label: "Deskripsi repo" },
      { key: "has_coc",          label: "Code of Conduct" },
    ],
  },
  issueManagement: {
    label:    "Issue Management",
    detailKeys: [
      { key: "avg_issue_close_time_days", label: "Rata-rata close time", format: (v: number) => `${v} hari` },
      { key: "open_issues_count",         label: "Open issues",          format: (v: number) => v.toString() },
      { key: "benchmark_hours",           label: "Benchmark",            format: () => "30 hari" },
    ],
  },
  velocity: {
    label:    "Velocity",
    detailKeys: [
      { key: "velocity_stability", label: "Stability index", format: (v: number) => v.toFixed(2) },
      { key: "interpretation",     label: "Status",          format: (v: string) => v },
    ],
  },
  popularity: {
    label:    "Popularitas",
    detailKeys: [
      { key: "stars",       label: "Stars",      format: (v: number) => v.toLocaleString() },
      { key: "forks_count", label: "Forks",      format: (v: number) => v.toLocaleString() },
      { key: "star_score",  label: "Star score", format: (v: number) => `${v.toFixed(1)} / 100` },
      { key: "fork_score",  label: "Fork score", format: (v: number) => `${v.toFixed(1)} / 100` },
    ],
  },
} as const
import { db } from "@/shared/lib/firebase"
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore"

export interface GithubIssue {
  pull_request?: unknown
  state:         string
  created_at:    string
  closed_at:     string
  user?:         { login?: string }
}

export interface GithubPR {
  merged_at:  string | null
  created_at: string
  user?:      { login?: string }
}

export interface GithubContributorWeek {
  w: number
  a: number
  d: number
  c: number
}

export interface GithubContributorStats {
  author?: { login?: string }
  total:   number
  weeks:   GithubContributorWeek[]
}

export interface ContributorStatsResult {
  stats:   GithubContributorStats[]
  pending: boolean
}

export interface DatedCommitCount {
  timestampMs: number
  count:       number
}

export function computeCommitStats(commits: number[]) {
  const mean        = commits.reduce((a, b) => a + b, 0) / 52
  const std         = Math.sqrt(commits.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 52)
  const n           = 52
  const sumX        = n * (n - 1) / 2
  const sumY        = commits.reduce((a, b) => a + b, 0)
  const sumXY       = commits.reduce((a, b, i) => a + i * b, 0)
  const sumX2       = commits.reduce((a, _b, i) => a + i * i, 0)
  const slope       = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const activeWeeks = commits.filter(c => c > 0).length
  return { mean, std, slope, activeWeeks }
}

export function computeAvgCloseTime(closedIssues: { created_at: string; closed_at: string }[]) {
  if (closedIssues.length === 0) return 0
  return closedIssues.reduce((sum, i) => {
    return sum + (new Date(i.closed_at).getTime() - new Date(i.created_at).getTime()) / 3600000
  }, 0) / closedIssues.length
}

export function buildFeatures({
  mean, std, slope, activeWeeks,
  onlyIssues, closedIssues, mergedPRs, pullRequestsArr, repoAgeDays,
  meta, avgIssueCloseTime,
}: {
  mean: number; std: number; slope: number; activeWeeks: number
  onlyIssues: unknown[]; closedIssues: unknown[]; mergedPRs: unknown[]
  pullRequestsArr: unknown[]; repoAgeDays: number
  meta: { description?: string | null; license?: unknown; open_issues_count: number; isPrivate: boolean; stars: number; forks: number }
  avgIssueCloseTime: number
}) {
  return {
    commit_frequency:     parseFloat(mean.toFixed(4)),
    activity_consistency: parseFloat(std.toFixed(4)),
    commit_trend:         parseFloat(slope.toFixed(6)),
    active_days_ratio:    parseFloat((activeWeeks / 52).toFixed(4)),
    issue_close_ratio:    parseFloat((closedIssues.length / Math.max(onlyIssues.length, 1)).toFixed(4)),
    total_issues:         onlyIssues.length,
    pr_merge_ratio:       parseFloat((mergedPRs.length / Math.max(pullRequestsArr.length, 1)).toFixed(4)),
    merged_pr_count:      mergedPRs.length,
    repo_age_days:        repoAgeDays,
    velocity_stability:   parseFloat((std / (mean + 1e-9)).toFixed(4)),
    has_description:      meta.description ? 1 : 0,
    has_license:          meta.license     ? 1 : 0,
    has_readme:           1,
    has_contributing:     0,
    has_coc:              0,
    open_issues_count:    meta.open_issues_count,
    stars:                meta.isPrivate ? null : meta.stars,
    forks_count:          meta.isPrivate ? null : meta.forks,
    avg_issue_close_time: avgIssueCloseTime,
  }
}

export interface HealthBreakdownComponent {
  score:        number
  weight:       number
  contribution: number
  details:      Record<string, unknown>
  missing:      string[]
}

export interface HealthApiResponse {
  healthScore:      number
  grade:            string
  gradeLabel:       string
  isPrivate?:       boolean
  breakdown:        Record<string, HealthBreakdownComponent>
  improvements?:    string[]
  recommendations?: string[]
}

function getHealthGrade(score: number): { grade: string; gradeLabel: string } {
  if (score >= 75) return { grade: "A", gradeLabel: "Excellent" }
  if (score >= 60) return { grade: "B", gradeLabel: "Good" }
  if (score >= 45) return { grade: "C", gradeLabel: "Fair" }
  if (score >= 30) return { grade: "D", gradeLabel: "Poor" }
  return { grade: "E", gradeLabel: "Critical" }
}

export function adjustHealthForActivity(
  healthData: HealthApiResponse,
  hasCommitActivity: boolean,
  hasIssueHistory:   boolean
): HealthApiResponse {
  const breakdown = { ...healthData.breakdown }
  let adjusted = false

  if (!hasCommitActivity && breakdown.velocity) {
    breakdown.velocity = {
      ...breakdown.velocity,
      score:        0,
      contribution: 0,
      missing:      ["Belum ada aktivitas commit yang bisa dinilai stabilitasnya"],
    }
    adjusted = true
  }

  const hasNoTrackRecordAtAll = !hasCommitActivity && !hasIssueHistory
  if (hasNoTrackRecordAtAll && breakdown.issueManagement) {
    breakdown.issueManagement = {
      ...breakdown.issueManagement,
      score:        0,
      contribution: 0,
      missing:      ["Belum ada riwayat issue, buat issue untuk melacak pekerjaan"],
    }
    adjusted = true
  }

  if (!adjusted) return healthData

  const healthScore = Object.values(breakdown).reduce((sum, c) => sum + c.contribution, 0)
  const { grade, gradeLabel } = getHealthGrade(healthScore)
  const improvements = Object.values(breakdown).flatMap(c => c.missing)

  const recommendations = [
    ...(!hasCommitActivity ? ["Belum ada aktivitas commit terdeteksi, mulai development untuk membangun rekam jejak repo"] : []),
    ...(healthData.recommendations ?? []),
  ]

  return {
    ...healthData,
    healthScore: parseFloat(healthScore.toFixed(2)),
    grade,
    gradeLabel,
    breakdown,
    improvements,
    recommendations,
  }
}

export async function callMLService(ML_URL: string, features: ReturnType<typeof buildFeatures>, isPrivate: boolean) {
  const [prodRes, healthRes] = await Promise.all([
    fetch(`${ML_URL}/predict/productivity`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        commit_frequency:     features.commit_frequency,
        activity_consistency: features.activity_consistency,
        commit_trend:         features.commit_trend,
        active_days_ratio:    features.active_days_ratio,
        issue_close_ratio:    features.issue_close_ratio,
        total_issues:         features.total_issues,
        pr_merge_ratio:       features.pr_merge_ratio,
        merged_pr_count:      features.merged_pr_count,
        repo_age_days:        features.repo_age_days,
      }),
    }),
    fetch(`${ML_URL}/predict/health`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        is_private:           isPrivate,
        velocity_stability:   features.velocity_stability,
        has_readme:           features.has_readme,
        has_contributing:     features.has_contributing,
        has_coc:              features.has_coc,
        has_license:          features.has_license,
        has_description:      features.has_description,
        stars:                features.stars,
        forks_count:          features.forks_count,
        open_issues_count:    features.open_issues_count,
        avg_issue_close_time: features.avg_issue_close_time,
      }),
    }),
  ])
  return [await prodRes.json(), await healthRes.json()]
}

export function buildMonthlyStats(
  commits:          DatedCommitCount[],
  pullRequestsArr:  { created_at: string }[],
  issuesArr:        { pull_request?: unknown; created_at: string }[],
  now: Date
) {
  const cutoff = new Date(now.getFullYear(), now.getMonth() - 11, 1)

  const commitsPerMonth = Array(12).fill(0)
  commits.forEach(({ timestampMs, count }) => {
    const d = new Date(timestampMs)
    if (d >= cutoff) commitsPerMonth[d.getMonth()] += count
  })

  const prPerMonth = Array(12).fill(0)
  pullRequestsArr.forEach(pr => {
    const d = new Date(pr.created_at)
    if (d >= cutoff) prPerMonth[d.getMonth()]++
  })

  const issuesPerMonth = Array(12).fill(0)
  issuesArr
    .filter(i => !i.pull_request)
    .forEach(issue => {
      const d = new Date(issue.created_at)
      if (d >= cutoff) issuesPerMonth[d.getMonth()]++
    })

  return { commitsPerMonth, prPerMonth, issuesPerMonth }
}

export async function upsertRepo(userId: string, fullName: string, repoData: object) {
  const q    = query(
    collection(db, "repositories"),
    where("userId",   "==", userId),
    where("fullName", "==", fullName)
  )
  const snap = await getDocs(q)
  if (snap.empty) {
    await addDoc(collection(db, "repositories"), repoData)
  } else {
    await updateDoc(doc(db, "repositories", snap.docs[0].id), repoData)
  }
}

export async function fetchContributorStats(
  fullName: string,
  headers:  Record<string, string>
): Promise<ContributorStatsResult> {
  const res = await fetch(`https://api.github.com/repos/${fullName}/stats/contributors`, { headers })

  if (res.status === 202) return { stats: [], pending: true }

  if (!res.ok) {
    console.error("Failed to fetch contributor stats", { fullName, status: res.status })
    return { stats: [], pending: false }
  }

  const data = await res.json()
  return { stats: Array.isArray(data) ? data : [], pending: false }
}

export function aggregateContributorWeeks(stats: GithubContributorStats[]): GithubContributorWeek[] {
  const byTimestamp = new Map<number, GithubContributorWeek>()

  stats.forEach(contributor => {
    contributor.weeks.forEach(week => {
      const existing = byTimestamp.get(week.w)
      if (existing) {
        existing.a += week.a
        existing.d += week.d
        existing.c += week.c
      } else {
        byTimestamp.set(week.w, { ...week })
      }
    })
  })

  return Array.from(byTimestamp.values()).sort((a, b) => a.w - b.w)
}

export function padWeeksTo52(weeks: GithubContributorWeek[]): GithubContributorWeek[] {
  if (weeks.length >= 52) return weeks.slice(-52)

  const missing           = 52 - weeks.length
  const earliestTimestamp = weeks[0]?.w ?? Math.floor(Date.now() / 1000)
  const padding: GithubContributorWeek[] = Array.from({ length: missing }, (_, i) => ({
    w: earliestTimestamp - (missing - i) * 7 * 24 * 60 * 60,
    a: 0,
    d: 0,
    c: 0,
  }))

  return [...padding, ...weeks]
}
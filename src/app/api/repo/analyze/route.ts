import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore"

interface GithubIssue {
  pull_request?: unknown
  state:         string
  created_at:    string
  closed_at:     string
}

interface GithubPR {
  merged_at:  string | null
  created_at: string
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { fullName } = await req.json()
  const [owner, repo] = fullName.split("/")

  try {
    const headers = { Authorization: `Bearer ${session.accessToken}` }

    const [participationRes, metaRes, commitsRes, prsRes, issuesRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${fullName}/stats/participation`, { headers }),
      fetch(`https://api.github.com/repos/${fullName}`, { headers }),
      fetch(`https://api.github.com/repos/${fullName}/stats/code_frequency`, { headers }),
      fetch(`https://api.github.com/repos/${fullName}/pulls?state=all&per_page=100`, { headers }),
      fetch(`https://api.github.com/repos/${fullName}/issues?state=all&per_page=100&filter=all`, { headers }),
    ])

    const participation = await participationRes.json()
    const meta          = await metaRes.json()
    const codeFrequency = await commitsRes.json()
    const pullRequests  = await prsRes.json()
    const issues        = await issuesRes.json()

    const commits: number[] = participation.all || []
    if (commits.length !== 52) {
      return NextResponse.json({ error: "Insufficient commit data" }, { status: 400 })
    }

    // ── Hitung fitur dari commit data ──────────────────────────
    const mean  = commits.reduce((a, b) => a + b, 0) / 52
    const std   = Math.sqrt(commits.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 52)
    const slope = (() => {
      const n     = 52
      const sumX  = n * (n - 1) / 2
      const sumY  = commits.reduce((a, b) => a + b, 0)
      const sumXY = commits.reduce((a, b, i) => a + i * b, 0)
      const sumX2 = commits.reduce((a, _b, i) => a + i * i, 0)
      return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    })()
    const activeWeeks = commits.filter(c => c > 0).length

    // ── Hitung fitur PR dan Issues ─────────────────────────────
    const onlyIssues   = Array.isArray(issues) ? issues.filter((i: GithubIssue) => !i.pull_request) : []
    const closedIssues = onlyIssues.filter((i: GithubIssue) => i.state === "closed")
    const mergedPRs    = Array.isArray(pullRequests) ? pullRequests.filter((p: GithubPR) => p.merged_at) : []
    const repoAgeDays    = meta.created_at
      ? Math.floor((Date.now() - new Date(meta.created_at).getTime()) / 86400000)
      : 0

    const features = {
      // Fitur model1 (productivity)
      commit_frequency:     parseFloat(mean.toFixed(4)),
      activity_consistency: parseFloat(std.toFixed(4)),
      commit_trend:         parseFloat(slope.toFixed(6)),
      active_days_ratio:    parseFloat((activeWeeks / 52).toFixed(4)),
      issue_close_ratio:    parseFloat((closedIssues.length / Math.max(onlyIssues.length, 1)).toFixed(4)),
      total_issues:         onlyIssues.length,
      pr_merge_ratio:       parseFloat((mergedPRs.length / Math.max(Array.isArray(pullRequests) ? pullRequests.length : 1, 1)).toFixed(4)),
      merged_pr_count:      mergedPRs.length,
      repo_age_days:        repoAgeDays,
      // Fitur model2 (health)
      velocity_stability:   parseFloat((std / (mean + 1e-9)).toFixed(4)),
      has_description:      meta.description ? 1 : 0,
      has_license:          meta.license     ? 1 : 0,
      has_readme:           1,
      has_contributing:     0,
      has_coc:              0,
      open_issues_count:    meta.open_issues_count || 0,
      stars:                meta.stargazers_count  || 0,
      forks_count:          meta.forks_count       || 0,
      avg_issue_close_time: closedIssues.length > 0
        ? closedIssues.reduce((sum: number, i: GithubIssue) => {
            const open   = new Date(i.created_at).getTime()
            const closed = new Date(i.closed_at).getTime()
            return sum + (closed - open) / 3600000
          }, 0) / closedIssues.length
        : 0,
    }

    const ML_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://127.0.0.1:8000"

    // ── Kirim ke ML service ────────────────────────────────────
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

    const prodData   = await prodRes.json()
    const healthData = await healthRes.json()

    // ── Hitung additions/deletions dari code_frequency ────────
    let totalAdditions = 0
    let totalDeletions = 0
    if (Array.isArray(codeFrequency)) {
      codeFrequency.forEach((week: number[]) => {
        totalAdditions += week[1] ?? 0
        totalDeletions += Math.abs(week[2] ?? 0)
      })
    }
    const totalChanges     = totalAdditions + totalDeletions
    const additionsPercent = totalChanges > 0 ? Math.round((totalAdditions / totalChanges) * 100) : 50
    const deletionsPercent = totalChanges > 0 ? Math.round((totalDeletions / totalChanges) * 100) : 50

    // ── Rolling 12 bulan terakhir ──────────────────────────────
    const now             = new Date()
    const commitsPerMonth = Array(12).fill(0)
    commits.forEach((weekCount: number, weekIdx: number) => {
      const weeksAgo      = 51 - weekIdx
      const d             = new Date(now)
      d.setDate(d.getDate() - weeksAgo * 7)
      const monthIdx      = 11 - Math.floor((51 - weekIdx) / 4.33)
      if (monthIdx >= 0 && monthIdx < 12) commitsPerMonth[monthIdx] += weekCount
    })

    const prPerMonth = Array(12).fill(0)
    if (Array.isArray(pullRequests)) {
      pullRequests.forEach((pr: { created_at: string }) => {
        const d        = new Date(pr.created_at)
        const monthIdx = 11 - Math.floor((now.getTime() - d.getTime()) / (30.44 * 86400000))
        if (monthIdx >= 0 && monthIdx < 12) prPerMonth[monthIdx]++
      })
    }

    const issuesPerMonth = Array(12).fill(0)
    if (Array.isArray(issues)) {
      issues
        .filter((issue: { pull_request?: unknown }) => !issue.pull_request)
        .forEach((issue: { created_at: string }) => {
          const d        = new Date(issue.created_at)
          const monthIdx = 11 - Math.floor((now.getTime() - d.getTime()) / (30.44 * 86400000))
          if (monthIdx >= 0 && monthIdx < 12) issuesPerMonth[monthIdx]++
        })
    }

    // ── Simpan ke Firestore ────────────────────────────────────
    const repoData = {
      userId:                session.user.id,
      fullName,
      owner,
      name:                  repo,
      description:           meta.description      || null,
      language:              meta.language         || null,
      stars:                 meta.stargazers_count  || 0,
      forks:                 meta.forks_count       || 0,
      isPrivate:             meta.private           || false,
      productivityState:     prodData.label         ?? "-",
      commitFrequency:       features.commit_frequency,
      activityConsistency:   features.activity_consistency,
      commitTrend:           features.commit_trend,
      activeDaysRatio:       features.active_days_ratio,
      productivityRec:       prodData.recommendation ?? null,
      healthScore:           healthData.healthScore  ?? 0,
      healthGrade:           healthData.grade        ?? "-",
      healthLabel:           healthData.gradeLabel   ?? "",
      healthBreakdown:       healthData.breakdown    ?? {},
      healthRecommendations: healthData.recommendations ?? [],
      additionsPercent,
      deletionsPercent,
      commitsPerMonth,
      prPerMonth,
      issuesPerMonth,
      analyzedAt:            serverTimestamp(),
    }

    const q    = query(
      collection(db, "repositories"),
      where("userId",   "==", session.user.id),
      where("fullName", "==", fullName)
    )
    const snap = await getDocs(q)

    if (snap.empty) {
      await addDoc(collection(db, "repositories"), repoData)
    } else {
      await updateDoc(doc(db, "repositories", snap.docs[0].id), repoData)
    }

    return NextResponse.json({ success: true, data: repoData })
  } catch (e) {
    console.error("Analyze error:", e)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
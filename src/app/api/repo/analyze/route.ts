import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/shared/lib/firebase"
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, getDoc } from "firebase/firestore"

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
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { fullName, provider, repoId } = await req.json()
  const [owner, repo] = fullName.split("/")

  try {
    // Ambil linkedProviders token jika tersedia
    const userSnap = await getDoc(doc(db, "users", session.user.id))
    const linked = userSnap.exists() ? (userSnap.data().linkedProviders ?? {}) : {}

    // Jika provider tidak ditentukan, coba cari di DB repositories
    let detectedProvider = provider
    if (!detectedProvider) {
      const q = query(
        collection(db, "repositories"),
        where("userId", "==", session.user.id),
        where("fullName", "==", fullName)
      )
      const snap = await getDocs(q)
      if (!snap.empty) {
        detectedProvider = (snap.docs[0].data() as any).provider
      }
    }

    if (detectedProvider === "gitlab") {
      // Use GitLab token from linked providers
      const token = linked.gitlab?.accessToken
      if (!token) return NextResponse.json({ error: "No GitLab token" }, { status: 401 })

      // Determine project id: prefer repoId from client, else try to resolve via search
      let projectId = repoId
      if (!projectId) {
        // try to find project by full path
        const searchRes = await fetch(`https://gitlab.com/api/v4/projects/${encodeURIComponent(fullName)}`, { headers: { Authorization: `Bearer ${token}` } })
        if (!searchRes.ok) return NextResponse.json({ error: "GitLab project not found" }, { status: searchRes.status })
        const proj = await searchRes.json()
        projectId = proj.id
      }

      // fetch project meta
      const metaRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}`, { headers: { Authorization: `Bearer ${token}` } })
      const meta = await metaRes.json()

      // fetch merge requests and issues
      const [mrsRes, issuesRes] = await Promise.all([
        fetch(`https://gitlab.com/api/v4/projects/${projectId}/merge_requests?state=all&per_page=100`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`https://gitlab.com/api/v4/projects/${projectId}/issues?state=all&per_page=100`, { headers: { Authorization: `Bearer ${token}` } }),
      ])

      const pullRequests = await mrsRes.json()
      const issues = await issuesRes.json()

      // Build commits per week for last 52 weeks by fetching commits since 52 weeks ago
      const now = new Date()
      const since = new Date()
      since.setDate(now.getDate() - 52 * 7)
      let pageNum = 1
      const commitsDates: string[] = []
      while (true) {
        const commitsRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits?per_page=100&page=${pageNum}&since=${since.toISOString()}`, { headers: { Authorization: `Bearer ${token}` } })
        if (!commitsRes.ok) break
        const batch = await commitsRes.json()
        if (!Array.isArray(batch) || batch.length === 0) break
        batch.forEach((c: any) => commitsDates.push(c.committed_date || c.created_at || c.authored_date))
        if (batch.length < 100) break
        pageNum++
      }

      // aggregate commits into 52-week buckets
      const commitsPerWeek = Array(52).fill(0)
      commitsDates.forEach(d => {
        const dt = new Date(d)
        const weeksAgo = Math.floor((now.getTime() - dt.getTime()) / (7 * 24 * 60 * 60 * 1000))
        if (weeksAgo >= 0 && weeksAgo < 52) {
          const idx = 51 - weeksAgo
          commitsPerWeek[idx] += 1
        }
      })

      const commits = commitsPerWeek

      // reuse same feature computations as GitHub branch below
      // (rest of feature extraction will follow unified path using meta, commits, pullRequests, issues)

      // map fields to match expectations of downstream code
      const participation = { all: commits }
      const codeFrequency = []
      const pullRequestsArr = Array.isArray(pullRequests) ? pullRequests : []
      const issuesArr = Array.isArray(issues) ? issues : []

      // reuse next section by assigning variables used later
      // ── Hitung fitur dari commit data ──────────────────────────
      const commitsArr: number[] = participation.all || []
      if (commitsArr.length !== 52) {
        return NextResponse.json({ error: "Insufficient commit data" }, { status: 400 })
      }

      const mean  = commitsArr.reduce((a, b) => a + b, 0) / 52
      const std   = Math.sqrt(commitsArr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 52)
      const slope = (() => {
        const n     = 52
        const sumX  = n * (n - 1) / 2
        const sumY  = commitsArr.reduce((a, b) => a + b, 0)
        const sumXY = commitsArr.reduce((a, b, i) => a + i * b, 0)
        const sumX2 = commitsArr.reduce((a, _b, i) => a + i * i, 0)
        return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
      })()
      const activeWeeks = commitsArr.filter(c => c > 0).length

      const onlyIssues   = issuesArr.filter((i: any) => !i.pull_request)
      const closedIssues = onlyIssues.filter((i: any) => i.state === "closed")
      const mergedPRs    = pullRequestsArr.filter((p: any) => p.merged_at)
      const repoAgeDays    = meta.created_at
        ? Math.floor((Date.now() - new Date(meta.created_at).getTime()) / 86400000)
        : 0

      const features = {
        commit_frequency:     parseFloat(mean.toFixed(4)),
        activity_consistency: parseFloat(std.toFixed(4)),
        commit_trend:         parseFloat(slope.toFixed(6)),
        active_days_ratio:    parseFloat((activeWeeks / 52).toFixed(4)),
        issue_close_ratio:    parseFloat((closedIssues.length / Math.max(onlyIssues.length, 1)).toFixed(4)),
        total_issues:         onlyIssues.length,
        pr_merge_ratio:       parseFloat((mergedPRs.length / Math.max(pullRequestsArr.length || 1, 1)).toFixed(4)),
        merged_pr_count:      mergedPRs.length,
        repo_age_days:        repoAgeDays,
        velocity_stability:   parseFloat((std / (mean + 1e-9)).toFixed(4)),
        has_description:      meta.description ? 1 : 0,
        has_license:          meta.license     ? 1 : 0,
        has_readme:           1,
        has_contributing:     0,
        has_coc:              0,
        open_issues_count:    meta.open_issues_count || 0,
        stars:                meta.visibility === "private" ? null : (meta.star_count  || 0),
        forks_count:          meta.visibility === "private" ? null : (meta.forks_count || 0),
        avg_issue_close_time: closedIssues.length > 0
          ? closedIssues.reduce((sum: number, i: any) => {
              const open   = new Date(i.created_at).getTime()
              const closed = new Date(i.closed_at).getTime()
              return sum + (closed - open) / 3600000
            }, 0) / closedIssues.length
          : 0,
      }

      // call ML service
      const ML_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://127.0.0.1:8000"
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
            is_private:           meta.visibility === "private",
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

      // compute additions/deletions not available from GitLab code_frequency
      const totalAdditions = 0
      const totalDeletions = 0
      const totalChanges     = totalAdditions + totalDeletions
      const additionsPercent = totalChanges > 0 ? Math.round((totalAdditions / totalChanges) * 100) : 50
      const deletionsPercent = totalChanges > 0 ? Math.round((totalDeletions / totalChanges) * 100) : 50

      // rolling months
      const commitsPerMonth = Array(12).fill(0)
      commitsArr.forEach((weekCount: number, weekIdx: number) => {
        const weeksAgo      = 51 - weekIdx
        const d             = new Date(now)
        d.setDate(d.getDate() - weeksAgo * 7)
        const monthIdx      = 11 - Math.floor((51 - weekIdx) / 4.33)
        if (monthIdx >= 0 && monthIdx < 12) commitsPerMonth[monthIdx] += weekCount
      })

      const prPerMonth = Array(12).fill(0)
      if (Array.isArray(pullRequestsArr)) {
        pullRequestsArr.forEach((pr: any) => {
          const d        = new Date(pr.created_at)
          const monthIdx = 11 - Math.floor((now.getTime() - d.getTime()) / (30.44 * 86400000))
          if (monthIdx >= 0 && monthIdx < 12) prPerMonth[monthIdx]++
        })
      }

      const issuesPerMonth = Array(12).fill(0)
      if (Array.isArray(issuesArr)) {
        issuesArr
          .filter((issue: any) => !issue.pull_request)
          .forEach((issue: any) => {
            const d        = new Date(issue.created_at)
            const monthIdx = 11 - Math.floor((now.getTime() - d.getTime()) / (30.44 * 86400000))
            if (monthIdx >= 0 && monthIdx < 12) issuesPerMonth[monthIdx]++
          })
      }

      const repoData = {
        userId:                session.user.id,
        fullName,
        provider:              "gitlab",
        owner,
        name:                  repo,
        description:           meta.description      || null,
        language:              meta.language         || null,
        stars:                 meta.visibility === "private" ? null : (meta.star_count  || 0),
        forks:                 meta.forks_count || 0,
        isPrivate:             meta.visibility === "private",
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
    }

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
      stars:                meta.private ? null : (meta.stargazers_count  || 0),
      forks_count:          meta.private ? null : (meta.forks_count       || 0),
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
          is_private:           meta.private           || false,
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
      provider:              "github",
      owner,
      name:                  repo,
      description:           meta.description      || null,
      language:              meta.language         || null,
      stars:                 meta.private ? null : (meta.stargazers_count  || 0),
      forks:                 meta.private ? null : (meta.forks_count       || 0),
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
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { fullName } = await req.json()
  const [owner, repo] = fullName.split("/")

  try {
    // 1. Fetch commit history 52 minggu
    const participationRes = await fetch(
      `https://api.github.com/repos/${fullName}/stats/participation`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    )
    const participation = await participationRes.json()
    const commits: number[] = participation.all || []

    if (commits.length !== 52) {
      return NextResponse.json({ error: "Insufficient commit data" }, { status: 400 })
    }

    // 2. Fetch repo metadata
    const metaRes = await fetch(`https://api.github.com/repos/${fullName}`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } })
    const meta = await metaRes.json()

    // 3. Hitung fitur
    const mean  = commits.reduce((a, b) => a + b, 0) / 52
    const std   = Math.sqrt(commits.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 52)
    const slope = (() => {
      const n = 52, sumX = n*(n-1)/2, sumY = commits.reduce((a,b)=>a+b,0)
      const sumXY = commits.reduce((a,b,i)=>a+i*b,0)
      const sumX2 = commits.reduce((_a,_b,i,_arr)=>_a+i*i,0)
      return (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX)
    })()
    const activeWeeks = commits.filter(c => c > 0).length

    const features = {
      commit_frequency:     parseFloat(mean.toFixed(4)),
      activity_consistency: parseFloat(std.toFixed(4)),
      commit_trend:         parseFloat(slope.toFixed(6)),
      active_days_ratio:    parseFloat((activeWeeks / 52).toFixed(4)),
      velocity_stability:   parseFloat((std / (mean + 1e-9)).toFixed(4)),
      has_description:      meta.description ? 1 : 0,
      has_license:          meta.license ? 1 : 0,
      open_issues_count:    meta.open_issues_count || 0,
      stars:                meta.stargazers_count || 0,
      forks_count:          meta.forks_count || 0,
      commit_count_total:   meta.size || 0,
    }

    // 4. Kirim ke FastAPI
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
        })
      }),
      fetch(`${ML_URL}/predict/health`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(features)
      })
    ])

    const prodData   = await prodRes.json()
    const healthData = await healthRes.json()

    // 5. Simpan ke Firestore
    const repoData = {
      userId:                session.user.id,
      fullName,
      owner,
      name:                  repo,
      description:           meta.description || null,
      language:              meta.language || null,
      stars:                 meta.stargazers_count || 0,
      forks:                 meta.forks_count || 0,
      isPrivate:             meta.private || false,
      productivityState:     prodData.productivityState,
      commitFrequency:       prodData.commitFrequency,
      activityConsistency:   prodData.activityConsistency,
      commitTrend:           prodData.commitTrend,
      activeDaysRatio:       prodData.activeDaysRatio,
      productivityRec:       prodData.recommendation,
      healthScore:           healthData.healthScore,
      healthGrade:           healthData.grade,
      healthLabel:           healthData.label,
      healthBreakdown:       healthData.breakdown,
      healthRecommendations: healthData.recommendations,
      analyzedAt:            serverTimestamp(),
    }

    // Cek apakah repo sudah ada
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
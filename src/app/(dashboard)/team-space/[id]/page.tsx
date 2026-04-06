import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import Link from "next/link"
import MemberManagement from "@/components/team-space/MemberManagement"
import MemberActions from "@/components/team-space/MemberActions"
import TeamSpaceFooterActions from "@/components/team-space/TeamSpaceFooterActions"

async function getTeamSpaceDetail(classId: string, userId: string) {
  try {
    const tsSnap = await getDoc(doc(db, "teamSpaces", classId))
    if (!tsSnap.exists()) return null
    const ts = tsSnap.data()

    const memberSnap = await getDocs(
      query(collection(db, "memberships"), where("classId", "==", classId))
    )
    const members = memberSnap.docs.map(d => {
      const m = d.data()
      return {
        id:                  d.id,
        userId:              m.userId,
        userName:            m.userName,
        userImage:           m.userImage,
        role:                m.role,
        status:              m.memberStatus || "pending",
        commitVelocity:      m.commitVelocity      || 0,
        contributionShare:   m.contributionShare   || 0,
        activityConsistency: m.activityConsistency || 0,
        activeWeeksRatio:    m.activeWeeksRatio    || 0,
        recommendation:      m.recommendation      || null,
        joinedAt:            m.joinedAt?.seconds ? m.joinedAt.seconds * 1000 : null,
      }
    })

    const myMembership = members.find(m => m.userId === userId)
    if (!myMembership) return null

    return {
      id:          classId,
      name:        ts.name,
      description: ts.description || null,
      repoFullName:ts.repoFullName,
      ownerId:     ts.ownerId,
      inviteCode:  ts.inviteCode,
      myRole:      myMembership.role,
      myMembership,
      members,
    }
  } catch (e) {
    return null
  }
}

const roleColor: Record<string, string> = {
  owner:       "#7B2D8B",
  evaluator:   "#2E86C1",
  contributor: "#3FB950",
}

const statusColor: Record<string, string> = {
  Active:   "#3FB950",
  Passive:  "#F9C74F",
  Inactive: "#F85149",
  pending:  "#888888",
}

export default async function TeamSpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const ts = await getTeamSpaceDetail(id, session.user.id)
  if (!ts) redirect("/team-space")

  const isEvaluator = ts.myRole === "owner" || ts.myRole === "evaluator"

  const activeCount  = ts.members.filter(m => m.status === "Active").length
  const passiveCount = ts.members.filter(m => m.status === "Passive").length
  const inactiveCount= ts.members.filter(m => m.status === "Inactive").length

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/team-space"
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-colors"
          style={{ color: "#555" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>{ts.name}</h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: roleColor[ts.myRole] || "#888" }}>
              {ts.myRole.charAt(0).toUpperCase() + ts.myRole.slice(1)}
            </span>
          </div>
          {ts.description && (
            <p className="text-sm mt-0.5" style={{ color: "#888" }}>{ts.description}</p>
          )}
          <p className="text-xs mt-1" style={{ color: "#aaa" }}>📁 {ts.repoFullName}</p>
        </div>

        {/* Invite Code — hanya evaluator/owner */}
        {isEvaluator && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: "#F4F6F9" }}>
            <span className="text-xs" style={{ color: "#888" }}>Kode:</span>
            <span className="font-mono font-bold tracking-widest" style={{ color: "#1E3A5F" }}>
              {ts.inviteCode}
            </span>
          </div>
        )}
      </div>

      {isEvaluator ? (
        /* ── TAMPILAN EVALUATOR ── */
        <div className="flex flex-col gap-6">

          {/* Team Overview */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Active",   count: activeCount,   color: "#3FB950" },
              { label: "Passive",  count: passiveCount,  color: "#F9C74F" },
              { label: "Inactive", count: inactiveCount, color: "#F85149" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}18` }}>
                  <div className="w-4 h-4 rounded-full" style={{ background: s.color }}/>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
                  <p className="text-sm" style={{ color: "#888" }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Member Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "#F0F0F0" }}>
              <h2 className="font-bold text-lg" style={{ color: "#1E3A5F" }}>Anggota Tim</h2>
              <MemberManagement
                classId={ts.id}
                members={ts.members}
                myRole={ts.myRole}
                ownerId={ts.ownerId}
              />
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ background: "#F4F6F9" }}>
                  {["Anggota", "Role", "Velocity", "Share", "Status", "Aksi"].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "#888" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ts.members.map((member) => (
                  <tr key={member.id} className="border-t" style={{ borderColor: "#F0F0F0" }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {member.userImage && (
                          <img src={member.userImage} alt="" className="w-8 h-8 rounded-full"/>
                        )}
                        <p className="text-sm font-medium" style={{ color: "#333" }}>{member.userName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded-full font-medium text-white"
                        style={{ background: roleColor[member.role] || "#888" }}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "#333" }}>
                      {member.commitVelocity.toFixed(1)}/hari
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "#333" }}>
                      {(member.contributionShare * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-sm font-medium"
                        style={{ color: statusColor[member.status] || "#888" }}>
                        <span className="w-2 h-2 rounded-full"
                          style={{ background: statusColor[member.status] || "#888" }}/>
                        {member.status === "pending" ? "Belum Dianalisis" : member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <MemberActions
                        memberId={member.id}
                        memberRole={member.role}
                        memberUserId={member.userId}
                        myRole={ts.myRole}
                        ownerId={ts.ownerId}
                        classId={ts.id}
                        />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── TAMPILAN CONTRIBUTOR ── */
        <div className="max-w-lg">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4" style={{ color: "#1E3A5F" }}>My Contribution</h2>

            {ts.myMembership.status === "pending" ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <span className="text-4xl">⏳</span>
                <p className="font-medium" style={{ color: "#333" }}>Belum Dianalisis</p>
                <p className="text-sm text-center" style={{ color: "#888" }}>
                  Data kontribusimu sedang menunggu analisis dari evaluator
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-bold" style={{ color: "#333" }}>Status</span>
                  <span className="px-4 py-1.5 rounded-full text-white font-semibold"
                    style={{ background: statusColor[ts.myMembership.status] || "#888" }}>
                    {ts.myMembership.status}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    { label: "Commit Velocity",     value: `${ts.myMembership.commitVelocity.toFixed(1)}/hari` },
                    { label: "Contribution Share",  value: `${(ts.myMembership.contributionShare * 100).toFixed(1)}%` },
                    { label: "Consistency",         value: ts.myMembership.activityConsistency <= 1.5 ? "Sangat Stabil" : ts.myMembership.activityConsistency <= 3 ? "Stabil" : "Tidak Stabil" },
                    { label: "Active Weeks",        value: `${Math.round(ts.myMembership.activeWeeksRatio * 100)}%` },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b"
                      style={{ borderColor: "#F0F0F0" }}>
                      <span className="text-sm" style={{ color: "#888" }}>{item.label}</span>
                      <span className="text-sm font-semibold" style={{ color: "#333" }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {ts.myMembership.recommendation && (
                  <div className="mt-4 p-3 rounded-xl" style={{ background: "#F0FFF4" }}>
                    <p className="text-sm" style={{ color: "#333" }}>
                      💡 {ts.myMembership.recommendation}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    <TeamSpaceFooterActions classId={ts.id} myRole={ts.myRole} />
    </div>
  )
}
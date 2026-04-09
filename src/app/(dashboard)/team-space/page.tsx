import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/shared/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import Link from "next/link"
import TeamSpaceActions from "@/components/team-space/TeamSpaceActions"

async function getUserTeamSpaces(userId: string) {
  try {
    const q    = query(collection(db, "memberships"), where("userId", "==", userId))
    const snap = await getDocs(q)
    const memberships = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[]

    const teamSpaces = await Promise.all(
      memberships.map(async (m) => {
        const tsSnap = await getDocs(
          query(collection(db, "teamSpaces"), where("__name__", "==", m.classId))
        )
        if (tsSnap.empty) return null
        const ts = tsSnap.docs[0].data()

        const memberSnap = await getDocs(
          query(collection(db, "memberships"), where("classId", "==", m.classId))
        )

        return {
          id:          m.classId,
          name:        ts.name,
          description: ts.description || null,
          role:        m.role,
          memberCount: memberSnap.size,
          repoName:    ts.repoFullName || null,
          createdAt:   ts.createdAt?.seconds ? ts.createdAt.seconds * 1000 : null,
        }
      })
    )

    return teamSpaces.filter(Boolean)
  } catch (e) {
    return []
  }
}

const roleColor: Record<string, string> = {
  owner:       "#7B2D8B",
  evaluator:   "#2E86C1",
  contributor: "#3FB950",
}

const roleLabel: Record<string, string> = {
  owner:       "Owner",
  evaluator:   "Evaluator",
  contributor: "Contributor",
}

export default async function TeamSpacePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const teamSpaces = await getUserTeamSpaces(session.user.id)

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>Team Space</h1>
          <p className="text-sm" style={{ color: "#888" }}>
            Kelola dan pantau kolaborasi tim kamu
          </p>
        </div>
        <TeamSpaceActions />
      </div>

      {/* List */}
      {teamSpaces.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl">👥</span>
          <p className="font-medium" style={{ color: "#333" }}>Belum ada Team Space</p>
          <p className="text-sm" style={{ color: "#888" }}>
            Buat atau bergabung ke Team Space untuk mulai evaluasi tim
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {teamSpaces.map((ts: any) => (
            <Link key={ts.id} href={`/team-space/${ts.id}`}
              className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow block">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate" style={{ color: "#1E3A5F" }}>{ts.name}</h3>
                  {ts.description && (
                    <p className="text-sm truncate mt-0.5" style={{ color: "#888" }}>{ts.description}</p>
                  )}
                </div>
                <span className="ml-3 px-3 py-1 rounded-full text-xs font-semibold text-white flex-shrink-0"
                  style={{ background: roleColor[ts.role] || "#888" }}>
                  {roleLabel[ts.role] || ts.role}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#888" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span className="text-xs" style={{ color: "#888" }}>{ts.memberCount} anggota</span>
                </div>
                {ts.repoName && (
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="#888" strokeWidth="2">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                    </svg>
                    <span className="text-xs truncate" style={{ color: "#888" }}>{ts.repoName}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
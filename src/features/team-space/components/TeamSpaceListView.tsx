"use client"

import { useState } from "react"
import Link from "next/link"
import { Users, GitBranch, Search } from "lucide-react"
import { useTeamSpaces } from "../hooks/useTeamSpaces"
import { ROLE_COLOR, ROLE_TEXT, ROLE_LABEL } from "../constants/TeamSpaceConfig"
import TeamSpaceActions from "./TeamSpaceActions"

function ListSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-2 flex-1">
              <div className="h-5 w-40 bg-gray-100 rounded" />
              <div className="h-4 w-56 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-20 bg-gray-100 rounded-full" />
          </div>
          <div className="flex gap-4 mt-4">
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-20 gap-3">
      <Users className="w-12 h-12 text-gray-300" />
      <p className="font-medium text-gray-700">Belum ada Team Space</p>
      <p className="text-sm text-gray-400">Buat atau bergabung ke Team Space untuk mulai kolaborasi</p>
    </div>
  )
}

export default function TeamSpaceListView() {
  const { teamSpaces, loading } = useTeamSpaces()
  const [search, setSearch]     = useState("")

  const filtered = teamSpaces.filter(ts =>
    ts.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Space</h1>
          <p className="text-sm text-gray-400">Kelola dan pantau kolaborasi tim kamu</p>
        </div>
        <TeamSpaceActions />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari team space..."
            className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((ts) => (
            <Link
              key={ts.id}
              href={`/team-space/${ts.id}`}
              className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow block border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 truncate">{ts.name}</h3>
                  {ts.description && (
                    <p className="text-sm text-gray-400 truncate mt-0.5">{ts.description}</p>
                  )}
                </div>
                <span
                  className="ml-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                  style={{ background: ROLE_COLOR[ts.role] ?? "#eee", color: ROLE_TEXT[ts.role] ?? "#333" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_TEXT[ts.role] ?? "#333" }} />
                  {ROLE_LABEL[ts.role] ?? ts.role}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-400">{ts.memberCount} Anggota</span>
                </div>
                {ts.repoName && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <GitBranch className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-400 truncate">{ts.repoName}</span>
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
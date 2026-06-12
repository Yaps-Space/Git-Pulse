import { Repo, SortKey, SortDir } from "../types"

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Hari ini"
  if (days === 1) return "Kemarin"
  if (days < 30)  return `${days} hari lalu`
  if (days < 365) return `${Math.floor(days / 30)} bulan lalu`
  return `${Math.floor(days / 365)} tahun lalu`
}

export function sortRepos(repos: Repo[], sortKey: SortKey, sortDir: SortDir): Repo[] {
  return [...repos].sort((a, b) => {
    let cmp = 0
    if (sortKey === "fullName") {
      cmp = a.fullName.localeCompare(b.fullName)
    } else if (sortKey === "healthScore") {
      cmp = (a.healthScore ?? 0) - (b.healthScore ?? 0)
    } else if (sortKey === "healthGrade") {
      cmp = (a.healthGrade ?? "").localeCompare(b.healthGrade ?? "")
    } else if (sortKey === "analyzedAt") {
      cmp = (a.analyzedAt ?? 0) - (b.analyzedAt ?? 0)
    }
    return sortDir === "asc" ? cmp : -cmp
  })
}
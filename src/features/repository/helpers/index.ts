import { Repo, SortKey, SortDir } from "../types"

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
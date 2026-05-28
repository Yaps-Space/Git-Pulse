import { TeamMember } from "../../types/TeamSpace"
import { SortKey, SortDir } from "../types/TeamSpaceMember"

export function sortMembers(members: TeamMember[], key: SortKey, dir: SortDir): TeamMember[] {
  return [...members].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    const cmp  = typeof aVal === "string"
      ? aVal.localeCompare(bVal as string)
      : (aVal as number) - (bVal as number)
    return dir === "asc" ? cmp : -cmp
  })
}
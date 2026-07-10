import { TeamMember } from "../../types/TeamSpace"
import { SortKey, SortDir } from "../types/TeamSpaceMember"
import { resolveMemberName } from "./resolveMemberName"

function getSortValue(member: TeamMember, key: SortKey): string | number {
  if (key === "displayName") return resolveMemberName(member)
  return member[key]
}

export function sortMembers(members: TeamMember[], key: SortKey, dir: SortDir): TeamMember[] {
  return [...members].sort((a, b) => {
    const aVal = getSortValue(a, key)
    const bVal = getSortValue(b, key)
    const cmp  = typeof aVal === "string"
      ? aVal.localeCompare(bVal as string)
      : (aVal as number) - (bVal as number)
    return dir === "asc" ? cmp : -cmp
  })
}
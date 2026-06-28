import { TeamMember } from "../../types/TeamSpace"

export function resolveMemberName(member: TeamMember): string {
  if (member.userId) return member.userName
  return member.displayName ?? member.userName
}
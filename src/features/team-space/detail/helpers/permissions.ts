export function canPromote(myRole: string, memberRole: string): boolean {
  if (memberRole !== "contributor") return false
  return myRole === "owner" || myRole === "evaluator"
}

export function canDemote(myRole: string, memberRole: string): boolean {
  if (memberRole !== "evaluator") return false
  return myRole === "owner"
}

export function canKick(myRole: string, memberRole: string): boolean {
  if (memberRole === "owner") return false
  if (myRole === "owner") return true
  if (myRole === "evaluator" && memberRole === "contributor") return true
  return false
}

export function canManageMembers(myRole: string): boolean {
  return myRole === "owner" || myRole === "evaluator"
}

export function canViewAllMembers(myRole: string): boolean {
  return myRole === "owner" || myRole === "evaluator"
}
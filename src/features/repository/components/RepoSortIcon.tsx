import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { SortKey, SortDir } from "../types"

interface Props {
  col:     SortKey
  sortKey: SortKey
  sortDir: SortDir
}

export function RepoSortIcon({ col, sortKey, sortDir }: Props) {
  if (col !== sortKey) return <ArrowUpDown className="w-3 h-3 opacity-40" />
  return sortDir === "asc"
    ? <ArrowUp   className="w-3 h-3" />
    : <ArrowDown className="w-3 h-3" />
}
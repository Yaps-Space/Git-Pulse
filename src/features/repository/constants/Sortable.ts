import { SortKey } from "../types"

export const SORTABLE_COLUMNS: { key: SortKey; label: string }[] = [
  { key: "fullName",    label: "Repository"    },
  { key: "healthScore", label: "Health Score"  },
  { key: "healthGrade", label: "Grade"         },
  { key: "analyzedAt",  label: "Last Analyzed" },
]
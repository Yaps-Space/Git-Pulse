import { SortKey } from "../types/TeamSpaceMember"

export const SORTABLE_MEMBER_COLUMNS: { key: SortKey; label: string }[] = [
  { key: "displayName",       label: "Anggota"            },
  { key: "commitVelocity",    label: "Frekuensi Commits"  },
  { key: "contributionShare", label: "Kontribusi"         },
  { key: "activeWeeksRatio",  label: "Active Weeks"       },
]
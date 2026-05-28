import { SortKey } from "../types/TeamSpaceMember"

export const SORTABLE_MEMBER_COLUMNS: { key: SortKey; label: string }[] = [
  { key: "userName",          label: "Anggota"           },
  { key: "commitVelocity",    label: "Frekuensi Commits" },
  { key: "contributionShare", label: "Kontribusi"        },
]
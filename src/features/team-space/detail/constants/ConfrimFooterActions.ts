export type ConfirmType = "leave" | "delete"

export const CONFIRM_CONFIG: Record<ConfirmType, { title: string; description: string; buttonLabel: string }> = {
  leave: {
    title:       "Leave Team Space?",
    description: "Kamu akan keluar dari Team Space ini. Aksi ini tidak bisa dibatalkan.",
    buttonLabel: "Ya, Keluar",
  },
  delete: {
    title:       "Delete Team Space?",
    description: "Seluruh data Team Space dan anggota akan dihapus permanen. Aksi ini tidak bisa dibatalkan.",
    buttonLabel: "Ya, Hapus",
  },
}

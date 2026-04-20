import { Users } from "lucide-react";

export function EmptyTeams() {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <Users className="w-8 h-8 text-gray-300" />
      <p className="text-sm font-medium text-gray-400">Belum ada team</p>
      <p className="text-sm text-gray-300 text-center">Buat atau bergabung ke team untuk mulai berkolaborasi</p>
    </div>
  )
}

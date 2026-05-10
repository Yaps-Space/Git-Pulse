import { Users } from "lucide-react";

export function EmptyState() {
  return (
    <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-20 gap-3">
      <Users className="w-12 h-12 text-gray-300" />
      <p className="font-medium text-gray-700">Belum ada Team Space</p>
      <p className="text-sm text-gray-400">Buat atau bergabung ke Team Space untuk mulai kolaborasi</p>
    </div>
  )
}

import { cn } from "@/shared/lib/utils"

interface ShowPerPageProps {
  value:    number
  options?: number[]
  onChange: (value: number) => void
  className?: string
}

export function ShowPerPage({
  value,
  options = [10, 25, 50],
  onChange,
  className,
}: ShowPerPageProps) {
  return (
    <div className={cn("flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-10", className)}>
      <span className="text-sm text-gray-500">Show:</span>
      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="text-sm outline-none bg-transparent text-gray-700"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
"use client"

import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { cn } from "@/shared/lib/utils"

interface ShowPerPageProps {
  value:      number
  options?:   number[]
  onChange:   (value: number) => void
  className?: string
  variant?:   "default" | "mobile"
}

export function ShowPerPage({
  value,
  options = [10, 25, 50],
  onChange,
  className,
  variant = "default",
}: ShowPerPageProps) {
  if (variant === "mobile") {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-200 h-10">
        <span className="text-sm text-gray-400">Show: </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 text-sm text-gray-700 outline-none">
              {value}
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[80px]">
            {options.map(o => (
              <DropdownMenuItem
                key={o}
                onClick={() => onChange(o)}
                className={cn(
                  "justify-center text-sm cursor-pointer",
                  o === value && "font-semibold text-gray-900 bg-gray-50"
                )}
              >
                {o}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 outline-none hover:border-gray-300 transition-colors",
            className
          )}
        >
          <span className="text-gray-400">Show:</span>
          <span className="font-medium">{value}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[80px]">
        {options.map(o => (
          <DropdownMenuItem
            key={o}
            onClick={() => onChange(o)}
            className={cn(
              "justify-center text-sm cursor-pointer",
              o === value && "font-semibold text-gray-900 bg-gray-50"
            )}
          >
            {o}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
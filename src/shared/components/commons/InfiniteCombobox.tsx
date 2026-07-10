"use client"

import { useState } from "react"
import { Check, ChevronDown, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/shared/components/ui/popover"
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from "@/shared/components/ui/command"
import { cn } from "@/shared/lib/utils"

export interface ComboboxOption {
  id:         string
  label:      string
  icon?:      React.ReactNode
  createdBy?: string | null
}

interface Props {
  options:            ComboboxOption[]
  value:              string | string[]
  onChange:           (value: string | string[]) => void
  placeholder?:       string
  searchPlaceholder?: string
  emptyMessage?:      string
  disabled?:          boolean
  multi?:             boolean
  onDelete?:          (id: string) => void
  className?:         string
}

export function InfiniteCombobox({
  options,
  value,
  onChange,
  placeholder       = "Pilih...",
  searchPlaceholder = "Cari...",
  emptyMessage      = "Tidak ada data",
  disabled          = false,
  multi             = false,
  onDelete,
  className,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  const currentUserId     = session?.user?.id

  const isSelected = (id: string) =>
    multi ? (value as string[]).includes(id) : value === id

  const handleSelect = (id: string) => {
    if (multi) {
      const arr = value as string[]
      onChange(arr.includes(id) ? arr.filter(v => v !== id) : [...arr, id])
    } else {
      onChange(id === value ? "" : id)
      setIsOpen(false)
    }
  }

  const displayLabel = () => {
    if (multi) {
      const arr = value as string[]
      if (arr.length === 0) return null
      return arr.map(id => {
        const opt = options.find(o => o.id === id)
        return (
          <span key={id} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-md flex items-center gap-1 truncate max-w-[160px]">
            {opt?.icon}
            {opt?.label ?? id}
          </span>
        )
      })
    }
    const opt = options.find(o => o.id === value)
    return opt ? (
      <span className="flex items-center gap-1.5 truncate">
        {opt.icon}
        {opt.label}
      </span>
    ) : null
  }

  const hasValue = multi ? (value as string[]).length > 0 : !!value

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-between min-h-10 px-3 py-2 rounded-lg border border-input text-sm transition-colors hover:bg-accent text-left",
            !hasValue && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <span className="flex flex-wrap gap-1 flex-1 min-w-0">
            {hasValue ? displayLabel() : placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9 text-sm" />
          <CommandList className="max-h-48 overflow-y-auto">
            <CommandEmpty className="py-3 text-center text-sm text-gray-400">
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup>
              {options.map(opt => {
                const canDelete = onDelete && opt.createdBy && opt.createdBy === currentUserId

                return (
                  <CommandItem
                    key={opt.id}
                    value={opt.label}
                    onSelect={() => handleSelect(opt.id)}
                    className="text-sm flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Check className={cn("h-4 w-4 flex-shrink-0", isSelected(opt.id) ? "opacity-100 text-[#00D964]" : "opacity-0")} />
                      {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {canDelete && (
                      <button
                        onClick={e => { e.stopPropagation(); onDelete(opt.id) }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity p-0.5 rounded flex-shrink-0 ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
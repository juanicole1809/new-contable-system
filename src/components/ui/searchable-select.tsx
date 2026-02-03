'use client'

import * as React from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface SearchableSelectOption {
  value: string
  label: string
  subtitle?: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  allowClear?: boolean
  onClear?: () => void
  className?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'No se encontraron resultados',
  disabled = false,
  allowClear = false,
  onClear,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((option) => option.value === value)

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between h-9 font-normal"
          >
            <span className="truncate">
              {selectedOption ? (
                <span className="flex items-center gap-2">
                  {selectedOption.label}
                  {selectedOption.subtitle && (
                    <span className="text-slate-500 text-xs">
                      {selectedOption.subtitle}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-slate-500">{placeholder}</span>
              )}
            </span>
            <div className="flex items-center gap-1">
              {allowClear && value && onClear && (
                <X
                  className="h-4 w-4 opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    onClear()
                  }}
                />
              )}
              <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.subtitle || ''} ${option.value}`}
                    onSelect={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.subtitle && (
                        <span className="text-xs text-slate-500">
                          {option.subtitle}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

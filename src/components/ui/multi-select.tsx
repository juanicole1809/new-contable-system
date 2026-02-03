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
import { Badge } from '@/components/ui/badge'

interface MultiSelectOption {
  value: string
  label: string
  subtitle?: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'No se encontraron resultados',
  disabled = false,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOptions = options.filter((option) => value.includes(option.value))

  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter((v) => v !== optionValue))
  }

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between h-9 font-normal min-h-9"
          >
            <div className="flex flex-wrap gap-1 flex-1 overflow-hidden">
              {selectedOptions.length === 0 ? (
                <span className="text-slate-500">{placeholder}</span>
              ) : (
                selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="mr-1 mb-0.5 text-xs"
                  >
                    {option.label}
                    <span
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover:opacity-80"
                      role="button"
                      tabIndex={0}
                      aria-label={`Eliminar ${option.label}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleRemove(option.value, e as any)
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={(e) => handleRemove(option.value, e)}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </span>
                  </Badge>
                ))
              )}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = value.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${option.subtitle || ''} ${option.value}`}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0'
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
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

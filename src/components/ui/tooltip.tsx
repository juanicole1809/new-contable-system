'use client'

import * as React from 'react'

interface TooltipProps {
  children: React.ReactNode
  content: string
  side?: 'left' | 'right' | 'top' | 'bottom'
}

export function Tooltip({ children, content, side = 'right' }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false)
    }, 100)
  }

  const sideClasses = {
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  }

  return (
    <div
      className="relative inline-block w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-[100] px-2 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200 ${sideClasses[side]}`}
        >
          {content}
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 border-4 ${
              side === 'right'
                ? 'right-full border-r-slate-900 border-t-transparent border-b-transparent border-l-transparent'
                : side === 'left'
                ? 'left-full border-l-slate-900 border-t-transparent border-b-transparent border-r-transparent'
                : side === 'top'
                ? 'bottom-full border-t-slate-900 border-l-transparent border-r-transparent border-b-transparent'
                : 'top-full border-b-slate-900 border-l-transparent border-r-transparent border-t-transparent'
            }`}
          />
        </div>
      )}
    </div>
  )
}

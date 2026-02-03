'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Building, Users, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'

const navItems = [
  { href: '/consorcios', label: 'Consorcios', icon: Building },
  { href: '/proveedores', label: 'Proveedores', icon: Users },
  { href: '/facturas', label: 'Facturas', icon: FileText },
]

function SidebarContent({ 
  isCollapsed, 
  onLinkClick 
}: { 
  isCollapsed: boolean
  onLinkClick?: () => void 
}) {
  const pathname = usePathname()

  return (
    <>
      {/* Header */}
      <div className={`p-4 border-b border-slate-800 transition-all duration-200 overflow-hidden ${isCollapsed ? 'px-2' : 'px-4 lg:px-6'}`}>
        {isCollapsed ? (
          <div className="flex items-center justify-center">
            <h1 className="text-lg font-bold text-white">C</h1>
          </div>
        ) : (
          <>
            <h1 className="text-lg lg:text-xl font-bold text-white whitespace-nowrap">
              Contable
            </h1>
            <p className="text-slate-400 text-xs lg:text-sm mt-1 whitespace-nowrap">Sistema de gestión</p>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 p-2 space-y-1 transition-all duration-200 overflow-hidden ${isCollapsed ? 'px-1' : 'px-3 lg:px-4'}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          const linkContent = (
            <Link
              href={item.href}
              onClick={onLinkClick}
              className={`flex items-center gap-2 lg:gap-3 rounded-lg transition-all duration-200 text-sm font-medium relative text-slate-300 hover:bg-slate-800 hover:text-white ${
                isCollapsed 
                  ? 'justify-center px-2 py-2 w-full' 
                  : 'px-3 lg:px-4 py-2 lg:py-3'
              } ${isActive ? 'bg-slate-800 text-white' : ''}`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
              )}
              <Icon className={`flex-shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 lg:w-5 lg:h-5'}`} />
              {!isCollapsed && (
                <span className="text-xs lg:text-sm whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          )

          if (isCollapsed) {
            return (
              <Tooltip key={item.href} content={item.label} side="right">
                {linkContent}
              </Tooltip>
            )
          }

          return <div key={item.href}>{linkContent}</div>
        })}
      </nav>

      {/* Footer */}
      <div className={`p-3 lg:p-4 border-t border-slate-800 transition-all duration-200 overflow-hidden ${isCollapsed ? 'px-2' : ''}`}>
        {isCollapsed ? (
          <div className="text-xs text-slate-500 text-center">v1</div>
        ) : (
          <div className="text-xs text-slate-500 text-center whitespace-nowrap">v1.0.0</div>
        )}
      </div>
    </>
  )
}

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const sidebarRef = useRef<HTMLAsideElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()

  // Cerrar el menú móvil cuando cambia la ruta
  const pathname = usePathname()
  useEffect(() => {
    setIsMobileMenuOpen(false)
    // Colapsar el sidebar después de hacer click en un link
    setIsHovered(false)
  }, [pathname])

  // Manejar hover con delay para evitar colapsar muy rápido
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    // Pequeño delay antes de colapsar para mejor UX
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 100)
  }

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  const isCollapsed = !isHovered

  return (
    <>
      {/* Mobile Header con botón hamburguesa */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="h-9 w-9"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Contable</h1>
              <p className="text-xs text-slate-500">Sistema de gestión</p>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed top-0 left-0 h-full w-64 bg-slate-900 z-50 md:hidden flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h1 className="text-lg font-bold text-white">Contable</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-9 w-9 text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <SidebarContent isCollapsed={false} onLinkClick={() => setIsMobileMenuOpen(false)} />
          </aside>
        </>
      )}

      {/* Desktop Sidebar - Overlay con hover, colapsado por defecto */}
      <aside 
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`hidden md:flex fixed left-0 top-0 h-full bg-slate-900 flex-col flex-shrink-0 z-40 transition-all duration-200 shadow-xl ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <SidebarContent 
          isCollapsed={isCollapsed} 
          onLinkClick={() => {
            // Colapsar después de hacer click
            setIsHovered(false)
          }} 
        />
      </aside>
    </>
  )
}

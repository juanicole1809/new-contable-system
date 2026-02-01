'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Building, Users, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/consorcios', label: 'Consorcios', icon: Building },
  { href: '/proveedores', label: 'Proveedores', icon: Users },
  { href: '/facturas', label: 'Facturas', icon: FileText },
]

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-slate-800">
        <h1 className="text-lg lg:text-xl font-bold text-white">
          Contable
        </h1>
        <p className="text-slate-400 text-xs lg:text-sm mt-1">Sistema de gestión</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-all duration-200 text-sm font-medium relative text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 lg:h-8 bg-blue-500 rounded-r-full" />
              )}
              <Icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              <span className="text-xs lg:text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 lg:p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500 text-center">
          v1.0.0
        </div>
      </div>
    </>
  )
}

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Cerrar el menú móvil cuando cambia la ruta
  const pathname = usePathname()
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

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
            <SidebarContent onLinkClick={() => setIsMobileMenuOpen(false)} />
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 min-h-screen flex-col flex-shrink-0">
        <SidebarContent />
      </aside>
    </>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Building, Users } from 'lucide-react'

const navItems = [
  { href: '/facturas', label: 'Facturas', icon: FileText },
  { href: '/proveedores', label: 'Proveedores', icon: Users },
  { href: '/consorcios', label: 'Consorcios', icon: Building },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">
          Contable
        </h1>
        <p className="text-slate-400 text-sm mt-1">Sistema de gestión</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium relative text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
              )}
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500 text-center">
          v1.0.0
        </div>
      </div>
    </aside>
  )
}

'use client'

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  // El sidebar es overlay, pero agregamos un pequeño padding para que el contenido no quede debajo del sidebar colapsado
  return (
    <main className="flex-1 bg-slate-50 pt-16 md:pt-0 md:pl-16">
      {children}
    </main>
  )
}

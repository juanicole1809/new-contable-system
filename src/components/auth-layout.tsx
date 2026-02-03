'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { SidebarWrapper } from '@/components/sidebar-wrapper'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <SidebarWrapper>
        {children}
      </SidebarWrapper>
    </div>
  )
}

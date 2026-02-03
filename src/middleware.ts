import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { data: { session } } = await supabase.auth.getSession()

  // If user is not logged in and trying to access protected routes, redirect to login
  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl, {
      ...response,
      headers: response.headers,
    })
  }

  // If user is logged in and trying to access login page, redirect to facturas
  if (session && request.nextUrl.pathname.startsWith('/login')) {
    const redirectUrl = new URL('/facturas', request.url)
    return NextResponse.redirect(redirectUrl, {
      ...response,
      headers: response.headers,
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

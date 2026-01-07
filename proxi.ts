import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isOnLogin = req.nextUrl.pathname === '/login'

  // Si intenta acceder al dashboard sin login, redirigir a login
  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Si ya está logueado e intenta ir a login, redirigir a dashboard
  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}

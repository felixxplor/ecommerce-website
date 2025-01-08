// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const wooSession = request.cookies.get('woocommerce-session')?.value

  if (
    wooSession &&
    (request.nextUrl.pathname === '/register' || request.nextUrl.pathname === '/login')
  ) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/register', '/login'], // Remove '/account' from matcher
}

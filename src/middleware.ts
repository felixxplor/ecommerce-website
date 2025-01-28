// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('woo-auth-token')?.value

  if (
    authToken &&
    (request.nextUrl.pathname === '/register' || request.nextUrl.pathname === '/login')
  ) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/register', '/login'], // Remove '/account' from matcher
}

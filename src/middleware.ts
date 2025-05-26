// middleware.ts
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export function middleware(request: NextRequest) {
//   const authToken = request.cookies.get('woo-auth-token')?.value

//   if (
//     authToken &&
//     (request.nextUrl.pathname === '/register' || request.nextUrl.pathname === '/login')
//   ) {
//     return NextResponse.redirect(new URL('/', request.url))
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ['/register', '/login'], // Remove '/account' from matcher
// }

// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of sensitive URL parameters that should be removed
const SENSITIVE_PARAMS = ['woo_session', 'token_secret', 'key', 'auth', 'password', 'secret']

// Define paths that should be protected with extra security
const SENSITIVE_PATHS = [
  '/order-confirmation',
  '/checkout/complete',
  '/checkout/success',
  '/payment/success',
  '/payment/cancel',
]

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Check if current path needs URL cleaning
  const needsCleaning = SENSITIVE_PATHS.some((path) => pathname.startsWith(path))

  if (!needsCleaning || !search) {
    return NextResponse.next()
  }

  // Clean sensitive parameters from URL
  const searchParams = new URLSearchParams(search)
  let hasRemovedParams = false

  // Check for sensitive parameters
  for (const param of SENSITIVE_PARAMS) {
    if (searchParams.has(param)) {
      searchParams.delete(param)
      hasRemovedParams = true
    }
  }

  // If we removed parameters, redirect to clean URL
  if (hasRemovedParams) {
    const cleanUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    return NextResponse.redirect(new URL(cleanUrl, request.url))
  }

  return NextResponse.next()
}

// Configure the matcher to apply the middleware only to specific routes
export const config = {
  matcher: [
    // Apply to order confirmation and checkout paths
    '/order-confirmation/:path*',
    '/checkout/:path*',
    '/payment/:path*',
  ],
}

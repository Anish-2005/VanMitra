import { NextResponse } from 'next/server'

export function middleware(request) {
  // Add cache headers for static assets
  if (request.nextUrl.pathname.startsWith('/_next/static/')) {
    return NextResponse.next({
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  }

  // Add cache headers for images
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    return NextResponse.next({
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
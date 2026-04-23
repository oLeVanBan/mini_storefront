import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware: handles ?secret=<ADMIN_SECRET> on any /admin/* route.
 * If the query param is present and valid, sets the admin_secret cookie
 * and redirects to the same URL without the query param.
 * If the cookie is absent/invalid on an /admin/* route, redirects to /admin/login.
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams, origin } = request.nextUrl

  // Only run on /admin/* routes (not /admin/login or /api/admin/*)
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next()
  }

  const adminSecret = process.env.ADMIN_SECRET
  const secretParam = searchParams.get('secret')

  // If ?secret= is provided and valid → set cookie and redirect (strip param)
  if (secretParam) {
    if (secretParam === adminSecret) {
      const url = request.nextUrl.clone()
      url.searchParams.delete('secret')
      const response = NextResponse.redirect(url)
      response.cookies.set('admin_secret', secretParam, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8, // 8 hours
      })
      return response
    }
    // Wrong secret → redirect to login
    return NextResponse.redirect(new URL('/admin/login', origin))
  }

  // No param → check cookie
  const cookieSecret = request.cookies.get('admin_secret')?.value
  if (!cookieSecret || cookieSecret !== adminSecret) {
    return NextResponse.redirect(new URL('/admin/login', origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

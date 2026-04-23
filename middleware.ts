import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { verifyAdminSession } from '@/lib/utils/admin-session'

/**
 * Middleware:
 * 1. Refreshes Supabase auth session on every request (shop routes)
 * 2. Protects /admin/* routes with HMAC-signed session cookie
 */
export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl
  let response = NextResponse.next({ request })

  // --- Supabase session refresh (for customer auth) ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  // Refresh session — must be called before checking auth status
  await supabase.auth.getUser()

  // --- Admin route protection ---
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_session')?.value ?? ''
    const result = await verifyAdminSession(token)
    if (!result.valid) {
      return NextResponse.redirect(new URL('/admin/login', origin))
    }
  }

  return response
}

export const config = {
  matcher: [
    // Protect admin routes + refresh Supabase session on all app routes
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

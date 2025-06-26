import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 🔄 Enhanced session handling with refresh attempt
  let user = null
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    user = currentUser
    
    // If no user, try to refresh the session (but catch JWT errors)
    if (!user) {
      try {
        const { data: { session } } = await supabase.auth.refreshSession()
        user = session?.user || null
      } catch (refreshError) {
        console.warn('Middleware refresh failed:', refreshError.message)
        // Don't throw, just continue with null user
        user = null
      }
    }
  } catch (error) {
    console.warn('Middleware auth error:', error.message)
    // Handle JWT errors gracefully
    if (error.message?.includes('JWT') || error.message?.includes('token')) {
      console.log('JWT error detected, treating as unauthenticated')
      user = null
    } else {
      user = null
    }
  }

  // Only protect specific routes (exclude login-related paths)
  const isProtected =
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api') &&
    !request.nextUrl.pathname.startsWith('/register') &&
    !request.nextUrl.pathname.startsWith('/_next') &&
    !request.nextUrl.pathname.startsWith('/favicon') &&
    !request.nextUrl.pathname.includes('/sign') && // Include sign-in, sign-up paths
    request.nextUrl.pathname !== '/' // Allow home page

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Only add redirectTo if not already on login page
    if (!request.nextUrl.pathname.startsWith('/login')) {
      url.searchParams.set('redirectTo', request.nextUrl.pathname)
    }
    return NextResponse.redirect(url)
  }

  // 🔧 Ensure session cookies are properly set for protected routes
  if (user && isProtected) {
    // Force session refresh to ensure cookies are fresh
    try {
      await supabase.auth.getSession()
    } catch (error) {
      console.warn('Session refresh failed:', error)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/customer/:path*',
    '/professional/:path*',
    '/management/:path*',
    '/settings/:path*',
  ],
}
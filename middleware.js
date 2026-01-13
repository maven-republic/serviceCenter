// Fixed middleware.js - Prevents auth rate limiting
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Simple rate limiting
const requestTracker = new Map()

function checkRateLimit(ip) {
  const now = Date.now()
  const requests = requestTracker.get(ip) || []
  
  // Filter requests from last minute
  const recentRequests = requests.filter(timestamp => now - timestamp < 60000)
  
  if (recentRequests.length >= 10) { // Reduced from 20 to 10
    return false
  }
  
  recentRequests.push(now)
  requestTracker.set(ip, recentRequests)
  return true
}

export async function middleware(request) {
  const pathname = request.nextUrl.pathname
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }
  
  // Check rate limiting
  if (!checkRateLimit(ip)) {
    console.warn(`Rate limit exceeded for IP: ${ip}`)
    return new NextResponse('Too Many Requests', { status: 429 })
  }
  
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

  let user = null
  
  try {
    // SINGLE auth call - no refresh, no multiple attempts
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userData?.user && !userError) {
      user = userData.user
    } else {
      // Don't attempt refresh here - let client handle it
      user = null
    }
    
  } catch (error) {
    console.warn('Middleware auth check failed:', error.message)
    user = null
    
    // For rate limit errors, let the request through
    if (error.message?.includes('rate limit') || error.status === 429) {
      return response
    }
  }

  // Define route types
  const isProtectedRoute = [
    '/customer',
    '/professional', 
    '/admin'
  ].some(route => pathname.startsWith(route))
  
  const isAuthRoute = [
    '/login',
    '/register',
    '/auth'
  ].some(route => pathname.startsWith(route))

  const isPublicRoute = [
    '/',
    '/about',
    '/contact',
    '/help',
    '/faq',
    '/terms',
    '/pricing',
    '/browse-services',
    '/services',
    '/blog',
    '/become-seller'
  ].some(route => pathname.startsWith(route))

  // Allow public routes
  if (isPublicRoute && !isProtectedRoute) {
    return response
  }

  // Redirect unauthenticated users from protected routes
  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    
    if (!request.nextUrl.searchParams.has('redirectTo')) {
      redirectUrl.searchParams.set('redirectTo', pathname)
    }
    
    console.log(`Redirecting unauthenticated user from ${pathname} to login`)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users from auth pages
  if (user && isAuthRoute && !pathname.includes('logout')) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo')
    if (redirectTo && !redirectTo.startsWith('/login') && !redirectTo.startsWith('/register')) {
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
    
    // Default redirect - you may need to determine user role here
    return NextResponse.redirect(new URL('/professional/workspace', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
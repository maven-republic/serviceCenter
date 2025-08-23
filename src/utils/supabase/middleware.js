// Updated middleware.js - Add public routes for service browsing
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Middleware configuration
const MIDDLEWARE_CONFIG = {
  sessionCacheTTL: 30000, // Cache session for 30 seconds
  maxRefreshAttempts: 1, // Reduce refresh attempts
  rateLimitWindow: 60000, // 1 minute window
  maxRequestsPerIP: 20, // Max requests per IP per window
  skipRefreshPaths: ['/api', '/_next', '/favicon', '/images'], // Paths to skip refresh
}

// Simple in-memory cache for sessions (in production, use Redis)
const sessionCache = new Map()
const requestTracker = new Map()

function getCachedSession(userId) {
  const cached = sessionCache.get(userId)
  if (!cached) return null
  
  const now = Date.now()
  if (now - cached.timestamp > MIDDLEWARE_CONFIG.sessionCacheTTL) {
    sessionCache.delete(userId)
    return null
  }
  
  return cached.session
}

function setCachedSession(userId, session) {
  sessionCache.set(userId, {
    session,
    timestamp: Date.now()
  })
}

function checkRateLimit(ip) {
  const now = Date.now()
  const requests = requestTracker.get(ip) || []
  
  // Filter out old requests
  const recentRequests = requests.filter(
    timestamp => now - timestamp < MIDDLEWARE_CONFIG.rateLimitWindow
  )
  
  if (recentRequests.length >= MIDDLEWARE_CONFIG.maxRequestsPerIP) {
    return false
  }
  
  recentRequests.push(now)
  requestTracker.set(ip, recentRequests)
  return true
}

function shouldSkipProcessing(pathname) {
  return MIDDLEWARE_CONFIG.skipRefreshPaths.some(path => 
    pathname.startsWith(path)
  )
}

export async function middleware(request) {
  const pathname = request.nextUrl.pathname
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  // Skip processing for static assets and API routes
  if (shouldSkipProcessing(pathname)) {
    return NextResponse.next()
  }
  
  // Check rate limiting
  if (!checkRateLimit(ip)) {
    console.warn(`🚦 Rate limit exceeded for IP: ${ip}`)
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
  let sessionError = null
  
  try {
    // First, try to get user without refresh to reduce API calls
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userData?.user && !userError) {
      user = userData.user
      
      // Check if we have a cached valid session
      const cachedSession = getCachedSession(user.id)
      if (cachedSession) {
        console.log('🔋 Using cached session for user:', user.email)
      } else {
        // Get fresh session and cache it
        try {
          const { data: sessionData } = await supabase.auth.getSession()
          if (sessionData?.session) {
            setCachedSession(user.id, sessionData.session)
          }
        } catch (sessionError) {
          console.warn('Session fetch failed, but user is valid:', sessionError.message)
          // Don't throw - we have a valid user
        }
      }
    } else if (userError) {
      // Handle specific error types
      if (userError.message?.includes('JWT') || 
          userError.message?.includes('invalid_token') ||
          userError.message?.includes('expired')) {
        
        console.log('🔄 JWT expired, attempting refresh...')
        
        // Only attempt refresh once and only for certain errors
        try {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
          
          if (refreshData?.session?.user && !refreshError) {
            user = refreshData.session.user
            setCachedSession(user.id, refreshData.session)
            console.log('✅ Session refreshed successfully for:', user.email)
          } else {
            console.warn('❌ Refresh failed:', refreshError?.message)
            user = null
            sessionError = refreshError
          }
        } catch (refreshError) {
          console.warn('❌ Refresh attempt failed:', refreshError.message)
          user = null
          sessionError = refreshError
        }
      } else {
        console.warn('🔍 User fetch failed:', userError.message)
        user = null
        sessionError = userError
      }
    }
    
  } catch (error) {
    console.error('🚨 Middleware auth error:', error.message)
    
    // Handle rate limiting errors specifically
    if (error.message?.includes('rate limit') || error.status === 429) {
      console.warn('🚦 Auth rate limited, treating as unauthenticated')
      
      // For rate limit errors, allow the request through but don't redirect
      // The client-side will handle this gracefully
      return response
    }
    
    user = null
    sessionError = error
  }

  // Define protected routes more precisely
  const isProtectedRoute = [
    '/customer',
    '/professional', 
    '/management',
    '/admin',
    '/settings'
  ].some(route => pathname.startsWith(route))
  
  const isAuthRoute = [
    '/login',
    '/register', 
    '/auth',
    '/sign-in',
    '/sign-up'
  ].some(route => pathname.startsWith(route))

  // Define public routes that don't require authentication
  const isPublicRoute = [
    '/',
    '/about',
    '/contact',
    '/help',
    '/faq',
    '/terms',
    '/pricing',
    '/browse-services', // <-- NEW: Allow public access to services
    '/services', // <-- NEW: Allow public service browsing
    '/service-single', // <-- NEW: Allow viewing individual services
    '/blog',
    '/become-seller'
  ].some(route => pathname.startsWith(route))

  // Allow public routes without authentication
  if (isPublicRoute && !isProtectedRoute) {
    console.log(`🌐 Public route accessed: ${pathname}`)
    return response
  }

  // Handle unauthenticated users on protected routes
  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    
    // Only add redirectTo if not already present and not a nested auth call
    if (!request.nextUrl.searchParams.has('redirectTo')) {
      redirectUrl.searchParams.set('redirectTo', pathname)
    }
    
    // Add error context if available
    if (sessionError?.message?.includes('rate limit')) {
      redirectUrl.searchParams.set('error', 'rate_limited')
    }
    
    console.log(`🔒 Redirecting unauthenticated user from ${pathname} to login`)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute && !pathname.includes('logout')) {
    console.log(`↩️ Redirecting authenticated user from ${pathname} to dashboard`)
    
    // Try to redirect to their intended destination or default workspace
    const redirectTo = request.nextUrl.searchParams.get('redirectTo')
    if (redirectTo && !redirectTo.startsWith('/login') && !redirectTo.startsWith('/register')) {
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
    
    // Default redirect based on user role (you might want to fetch this from your user store)
    return NextResponse.redirect(new URL('/professional/workspace', request.url))
  }

  // Optional: Ensure session cookies are properly set for authenticated users
  if (user && isProtectedRoute) {
    try {
      // Lightweight session validation - don't fetch, just ensure cookies are fresh
      const session = getCachedSession(user.id)
      if (!session) {
        // Try to get session without refresh to set cookies
        await supabase.auth.getSession()
      }
    } catch (error) {
      // Don't block the request if session validation fails
      console.warn('⚠️ Session cookie refresh failed:', error.message)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
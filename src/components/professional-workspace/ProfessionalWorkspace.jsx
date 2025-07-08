'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import toggleStore from '@/store/toggleStore'
import ProfessionalAxis from './header/ProfessionalAxis'
import DashboardSidebar from './sidebar/DashboardSidebar'
import DashboardFooter from './footer/DashboardFooter'
import { useUserStore } from '@/store/userStore'

export default function ProfessionalWorkspace({ children }) {
  const isActive = toggleStore((state) => state.isDasboardSidebarActive)
  const { user, fetchUser, isLoading } = useUserStore()
  const session = useSession()
  const supabase = useSupabaseClient()
  
  const [authState, setAuthState] = useState({
    isAuthenticating: true,
    sessionRestored: false,
    error: null
  })
  
  const fetchAttempted = useRef(false)
  const recoveryAttempted = useRef(false)

  // 🔄 Force session recovery on mount with rate limiting protection
  useEffect(() => {
    let mounted = true
    
    const ensureAuthentication = async () => {
      if (recoveryAttempted.current) return
      recoveryAttempted.current = true
      
      try {
        console.log('🔧 Ensuring authentication...')
        
        // 1. Try to get session from server (this should work even after quick reloads)
        const { data: { session: serverSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('⚠️ Error getting session:', error)
          // Don't throw on auth errors, just continue
        }
        
        if (serverSession) {
          console.log('✅ Server session found:', {
            user: serverSession.user?.email,
            expiresAt: serverSession.expires_at
          })
          
          // Session exists on server, force client sync
          if (mounted) {
            setAuthState({ 
              isAuthenticating: false, 
              sessionRestored: true, 
              error: null 
            })
          }
          return
        }
        
        // 2. No server session - DON'T attempt refresh to avoid rate limiting
        console.log('⚠️ No server session found, checking if on protected route...')
        
        // 3. Check if we're on a protected route but have no session
        const currentPath = window.location.pathname
        const isProtectedRoute = 
          currentPath.startsWith('/professional/') ||
          currentPath.startsWith('/customer/') ||
          currentPath.startsWith('/management/')
        
        if (isProtectedRoute) {
          console.log('⚠️ No valid session found on protected route, redirecting to login')
          // User should be logged in but isn't - redirect to login
          window.location.href = '/login?redirectTo=' + encodeURIComponent(currentPath)
          return
        }
        
        if (mounted) {
          setAuthState({ 
            isAuthenticating: false, 
            sessionRestored: false, 
            error: 'No session found' 
          })
        }
        
      } catch (error) {
        console.error('❌ Authentication error:', error)
        
        // Handle rate limiting specifically
        if (error.message?.includes('rate limit')) {
          console.log('⚠️ Rate limited, waiting before redirect...')
          setTimeout(() => {
            if (mounted) {
              window.location.href = '/login'
            }
          }, 2000)
          return
        }
        
        if (mounted) {
          setAuthState({ 
            isAuthenticating: false, 
            sessionRestored: false, 
            error: error.message 
          })
        }
      }
    }
    
    // Run immediately
    ensureAuthentication()
    
    return () => {
      mounted = false
    }
  }, [supabase])

  // 🎯 Monitor session state changes with timeout
  useEffect(() => {
    if (session) {
      console.log('📡 Session state updated:', {
        user: session.user?.email,
        isValid: !!session.user,
        expiresAt: session.expires_at
      })
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticating: false,
        sessionRestored: true,
        error: null
      }))
    } else {
      console.log('📡 Session is null/undefined')
    }
  }, [session])

  // 🔧 Add timeout for stuck syncing with retry
  useEffect(() => {
    if (authState.sessionRestored && !session) {
      console.log('⏳ Session restored but client session not ready, starting timeout...')
      
      const timeout = setTimeout(() => {
        if (authState.retryCount < 1) {
          console.warn('⚠️ Sync timeout! Attempting one retry before redirect...')
          
          // Try ONE more time with a full reset
          setAuthState(prev => ({
            isAuthenticating: true,
            sessionRestored: false,
            error: null,
            retryCount: prev.retryCount + 1
          }))
          
          // Reset recovery attempt flag
          recoveryAttempted.current = false
        } else {
          console.warn('🚨 Sync failed after retry, redirecting to login')
          const currentPath = window.location.pathname
          window.location.href = `/login?redirectTo=${encodeURIComponent(currentPath)}`
        }
      }, 3000) // Reduced to 3 seconds
      
      return () => clearTimeout(timeout)
    }
  }, [authState.sessionRestored, session, authState.retryCount])

  // 📊 Fetch user data when authenticated
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!session?.user?.email) return
    if (user || isLoading) return
    if (fetchAttempted.current) return

    console.log('🚀 Fetching user data for:', session.user.email)
    fetchAttempted.current = true
    fetchUser(session.user, supabase)
  }, [session?.user?.email, user, isLoading, fetchUser, supabase])

  // 🔄 Reset fetch attempt when session user changes
  useEffect(() => {
    fetchAttempted.current = false
  }, [session?.user?.email])

  // 🎨 Render states

  // Still authenticating
  if (authState.isAuthenticating) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Authenticating...</p>
        <small className="text-muted">Ensuring you stay logged in...</small>
      </div>
    )
  }

  // Authentication failed
  if (authState.error && !authState.sessionRestored) {
    return (
      <div className="text-center p-5">
        <div className="alert alert-warning">
          <h5>Authentication Required</h5>
          <p>Please log in to continue.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Session restored but client session not ready yet
  if (authState.sessionRestored && !session) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-success" role="status" />
        <p className="mt-2">Session restored, syncing...</p>
        <small className="text-muted d-block mt-2">
          If this takes more than a few seconds, try refreshing the page
        </small>
      </div>
    )
  }

  // Session exists but no authenticated user
  if (session && !session.user) {
    return (
      <div className="text-center p-5">
        <div className="alert alert-warning">
          <p>Session found but user is missing. Please log in again.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // User data still loading
  if (isLoading || !user || !user.account?.account_id) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading your dashboard...</p>
        <small className="text-muted">Setting up your workspace...</small>
      </div>
    )
  }

  // In ProfessionalWorkspace.jsx - replace the return statement
return (
  <div className="min-h-screen bg-background">
    <div className={`flex ${isActive ? 'dashboard-sidebar-hidden' : ''}`}>
      {/* Sidebar with fixed width */}
      <DashboardSidebar />
      
      {/* Main content with proper offset */}
      <div className="flex-1 ml-[300px] transition-all duration-300 ease-in-out">
        <div className="p-6">
          {children}
        </div>
        {/* <DashboardFooter /> */}
      </div>
    </div>
  </div>
)
}
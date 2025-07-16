'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { createClient } from '@/utils/supabase/client'

const PROVIDER_CONFIG = {
  hydrationDelay: 100,
  retryAttempts: 3,
  cacheDuration: 60000, // 1 minute
  sessionRefreshThreshold: 300000, // 5 minutes before expiry
}

export default function SupabaseProvider({ children, initialSession = null }) {
  const [supabaseClient] = useState(() => {
    console.log('🔄 SupabaseProvider initialized')
    return createClient()
  })
  
  const [session, setSession] = useState(initialSession)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  
  const retryCountRef = useRef(0)
  const sessionCacheRef = useRef(null)
  const lastFetchRef = useRef(0)

  // Enhanced session fetcher with caching and retry logic
  const fetchSession = useCallback(async (forceRefresh = false) => {
    const now = Date.now()
    
    // Use cached session if recent and not forcing refresh
    if (!forceRefresh && 
        sessionCacheRef.current && 
        now - lastFetchRef.current < PROVIDER_CONFIG.cacheDuration) {
      console.log('📋 Using cached session')
      return sessionCacheRef.current
    }

    try {
      console.log('🔍 Fetching session from Supabase')
      const { data: { session }, error } = await supabaseClient.auth.getSession()
      
      if (error) {
        console.error('Session fetch error:', error)
        
        // If we have a cached session and it's just a network error, use it
        if (sessionCacheRef.current && 
            (error.message?.includes('network') || 
             error.message?.includes('fetch'))) {
          console.log('📋 Using cached session due to network error')
          return sessionCacheRef.current
        }
        
        return null
      }
      
      // Cache the session
      sessionCacheRef.current = session
      lastFetchRef.current = now
      retryCountRef.current = 0 // Reset retry count on success
      
      return session
    } catch (error) {
      console.error('Session fetch failed:', error)
      
      // Return cached session if available
      if (sessionCacheRef.current) {
        console.log('📋 Returning cached session due to error')
        return sessionCacheRef.current
      }
      
      return null
    }
  }, [supabaseClient])

  // Initialize session on mount
  useEffect(() => {
    let mounted = true
    
    const initializeSession = async () => {
      try {
        setIsLoading(true)
        
        // Add small delay to prevent hydration mismatch
        await new Promise(resolve => setTimeout(resolve, PROVIDER_CONFIG.hydrationDelay))
        
        if (!mounted) return
        
        const currentSession = await fetchSession()
        
        if (!mounted) return
        
        setSession(currentSession)
        setIsHydrated(true)
        
        console.log('🎉 Session initialized:', currentSession?.user?.email || 'No session')
      } catch (error) {
        console.error('Session initialization failed:', error)
        if (mounted) {
          setSession(null)
          setIsHydrated(true)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initializeSession()
    
    return () => {
      mounted = false
    }
  }, [fetchSession])

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔄 Auth state change:', event, newSession?.user?.email || 'No session')
        
        // Filter out token refresh events to reduce noise
        if (event === 'TOKEN_REFRESHED') {
          console.log('📋 Token refreshed, updating cached session')
          sessionCacheRef.current = newSession
          lastFetchRef.current = Date.now()
          setSession(newSession)
          return
        }

        // Handle significant auth changes
        if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) {
          sessionCacheRef.current = newSession
          lastFetchRef.current = Date.now()
          setSession(newSession)
          
          if (event === 'SIGNED_OUT') {
            sessionCacheRef.current = null
            lastFetchRef.current = 0
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabaseClient])

  // Enhanced session refresh logic
  useEffect(() => {
    if (!session || !isHydrated) return

    const checkSessionExpiry = () => {
      if (!session?.expires_at) return

      const expiresAt = new Date(session.expires_at * 1000)
      const now = new Date()
      const timeUntilExpiry = expiresAt.getTime() - now.getTime()

      // If session expires within threshold, try to refresh
      if (timeUntilExpiry < PROVIDER_CONFIG.sessionRefreshThreshold && timeUntilExpiry > 0) {
        console.log('⏰ Session expiring soon, attempting refresh...')
        
        // Use a more conservative refresh approach
        fetchSession(true).then(refreshedSession => {
          if (refreshedSession && refreshedSession !== session) {
            console.log('✅ Session refreshed successfully')
          }
        }).catch(error => {
          console.warn('⚠️ Session refresh failed:', error.message)
        })
      }
    }

    // Check immediately and then every minute
    checkSessionExpiry()
    const interval = setInterval(checkSessionExpiry, 60000)

    return () => clearInterval(interval)
  }, [session, isHydrated, fetchSession])

  // Provide loading state during hydration
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={session}
    >
      {children}
    </SessionContextProvider>
  )
}
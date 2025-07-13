'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useUserStore } from '@/store/userStore'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Briefcase, User, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import DashboardSidebar from './sidebar/DashboardSidebar'

// Modern loading component
const ModernAuthLoading = ({ message, submessage }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6">
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">{message}</h3>
            {submessage && (
              <p className="text-sm text-muted-foreground">{submessage}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)

// Modern error component
const ModernAuthError = ({ title, description, action, onRetry }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6">
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-3">
            <div>
              <div className="font-medium">{title}</div>
              <div className="text-sm mt-1">{description}</div>
            </div>
            <div className="flex flex-col space-y-2">
              {action}
              {onRetry && (
                <Button variant="outline" onClick={onRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  </div>
)

export default function ProfessionalWorkspace({ children }) {
  const { user, fetchUser, isLoading } = useUserStore()
  const session = useSession()
  const supabase = useSupabaseClient()
  
  const [authState, setAuthState] = useState({
    isAuthenticating: true,
    sessionRestored: false,
    error: null,
    retryCount: 0
  })
  
  const fetchAttempted = useRef(false)
  const recoveryAttempted = useRef(false)

  // 🔄 Enhanced session recovery with modern error handling
  useEffect(() => {
    let mounted = true
    
    const ensureAuthentication = async () => {
      if (recoveryAttempted.current) return
      recoveryAttempted.current = true
      
      try {
        console.log('🔧 Ensuring authentication...')
        
        const { data: { session: serverSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('⚠️ Error getting session:', error)
        }
        
        if (serverSession) {
          console.log('✅ Server session found:', {
            user: serverSession.user?.email,
            expiresAt: serverSession.expires_at
          })
          
          if (mounted) {
            setAuthState({ 
              isAuthenticating: false, 
              sessionRestored: true, 
              error: null,
              retryCount: 0
            })
          }
          return
        }
        
        const currentPath = window.location.pathname
        const isProtectedRoute = 
          currentPath.startsWith('/professional/') ||
          currentPath.startsWith('/customer/') ||
          currentPath.startsWith('/management/')
        
        if (isProtectedRoute) {
          console.log('⚠️ No valid session found on protected route, redirecting to login')
          window.location.href = '/login?redirectTo=' + encodeURIComponent(currentPath)
          return
        }
        
        if (mounted) {
          setAuthState({ 
            isAuthenticating: false, 
            sessionRestored: false, 
            error: 'No session found',
            retryCount: 0
          })
        }
        
      } catch (error) {
        console.error('❌ Authentication error:', error)
        
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
            error: error.message,
            retryCount: 0
          })
        }
      }
    }
    
    ensureAuthentication()
    
    return () => {
      mounted = false
    }
  }, [supabase])

  // 🎯 Monitor session state changes
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
    }
  }, [session])

  // 🔧 Timeout handling with retry capability
  useEffect(() => {
    if (authState.sessionRestored && !session) {
      console.log('⏳ Session restored but client session not ready, starting timeout...')
      
      const timeout = setTimeout(() => {
        if (authState.retryCount < 1) {
          console.warn('⚠️ Sync timeout! Attempting one retry before redirect...')
          
          setAuthState(prev => ({
            isAuthenticating: true,
            sessionRestored: false,
            error: null,
            retryCount: prev.retryCount + 1
          }))
          
          recoveryAttempted.current = false
        } else {
          console.warn('🚨 Sync failed after retry, redirecting to login')
          const currentPath = window.location.pathname
          window.location.href = `/login?redirectTo=${encodeURIComponent(currentPath)}`
        }
      }, 3000)
      
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

  // Retry function for errors
  const handleRetry = () => {
    setAuthState({
      isAuthenticating: true,
      sessionRestored: false,
      error: null,
      retryCount: 0
    })
    recoveryAttempted.current = false
  }

  // 🎨 Modern render states
  if (authState.isAuthenticating) {
    return (
      <ModernAuthLoading 
        message="Authenticating..." 
        submessage="Ensuring you stay logged in..."
      />
    )
  }

  if (authState.error && !authState.sessionRestored) {
    return (
      <ModernAuthError
        title="Authentication Required"
        description="Please log in to continue."
        action={
          <Button 
            onClick={() => window.location.href = '/login'}
            className="w-full"
          >
            <User className="mr-2 h-4 w-4" />
            Go to Login
          </Button>
        }
        onRetry={handleRetry}
      />
    )
  }

  if (authState.sessionRestored && !session) {
    return (
      <ModernAuthLoading 
        message="Session restored, syncing..." 
        submessage="If this takes more than a few seconds, try refreshing the page"
      />
    )
  }

  if (session && !session.user) {
    return (
      <ModernAuthError
        title="Session Error"
        description="Session found but user is missing. Please log in again."
        action={
          <Button 
            onClick={() => window.location.href = '/login'}
            className="w-full"
          >
            <User className="mr-2 h-4 w-4" />
            Go to Login
          </Button>
        }
      />
    )
  }

  if (isLoading || !user || !user.account?.account_id) {
    return (
      <ModernAuthLoading 
        message="Loading your dashboard..." 
        submessage="Setting up your workspace..."
      />
    )
  }

  // ✅ Modern layout with proper styling
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[280px] flex-shrink-0 border-r border-border bg-card">
          <DashboardSidebar />
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 space-y-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
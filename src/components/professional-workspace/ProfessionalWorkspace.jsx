'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useUserStore } from '@/store/userStore'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, User, RefreshCw } from 'lucide-react'
import DashboardSidebar from './sidebar/DashboardSidebar'

// Simplified loading component
const SimpleLoading = ({ message = "Loading..." }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6">
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">{message}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)

// Simple error component
const SimpleError = ({ title, description, onRetry }) => (
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
              <Button 
                onClick={() => window.location.href = '/login'}
                className="w-full"
              >
                <User className="mr-2 h-4 w-4" />
                Go to Login
              </Button>
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
    isReady: false,
    error: null
  })
  
  const fetchAttempted = useRef(false)
  const authChecked = useRef(false)

  console.log('🏢 ProfessionalWorkspace render:', {
    hasSession: !!session,
    sessionUser: session?.user?.email,
    hasUser: !!user,
    userAccountId: user?.account?.account_id,
    isLoading,
    authState
  })

  // ONE-TIME authentication check
  useEffect(() => {
    if (authChecked.current) return
    authChecked.current = true
    
    console.log('🔍 One-time authentication check...')
    
    // Check if we have everything we need
    if (session?.user && user?.account?.account_id) {
      console.log('✅ Already authenticated and user loaded')
      setAuthState({ isReady: true, error: null })
      return
    }
    
    // If we have session but no user, that's fine - fetchUser will handle it
    if (session?.user) {
      console.log('✅ Session found, waiting for user data...')
      setAuthState({ isReady: true, error: null })
      return
    }
    
    // No session at all
    console.log('❌ No session found')
    setAuthState({ 
      isReady: false, 
      error: 'Maximum authentication attempts reached. Please refresh the page.' 
    })
  }, [session, user])

  // Fetch user data when we have a session
  useEffect(() => {
    if (!session?.user?.email || user || isLoading || fetchAttempted.current) {
      return
    }
    
    console.log('👤 Fetching user data for:', session.user.email)
    fetchAttempted.current = true
    fetchUser(session.user, supabase)
  }, [session?.user?.email, user, isLoading, fetchUser, supabase])

  // Reset fetch attempt when user changes
  useEffect(() => {
    fetchAttempted.current = false
  }, [session?.user?.email])

  // Retry handler
  const handleRetry = () => {
    authChecked.current = false
    fetchAttempted.current = false
    setAuthState({ isReady: false, error: null })
  }

  // If we have an error, show it
  if (authState.error) {
    return (
      <SimpleError
        title="Authentication Error"
        description={authState.error}
        onRetry={handleRetry}
      />
    )
  }

  // If we're not ready and don't have everything, show loading
  if (!authState.isReady || !session?.user) {
    return <SimpleLoading message="Checking authentication..." />
  }

  // Show loading while fetching user data
  if (isLoading || !user?.account?.account_id) {
    return <SimpleLoading message="Loading your dashboard..." />
  }

  // Success! Render the workspace
  console.log('🎉 Rendering workspace for:', user.account.email)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen overflow-hidden">
        <aside className="w-[280px] flex-shrink-0 border-r border-border bg-card">
          <DashboardSidebar />
        </aside>
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 space-y-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
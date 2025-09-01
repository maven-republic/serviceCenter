// ===== ENHANCED ProfessionalWorkspace.jsx - SMOOTH SIDEBAR ANIMATIONS =====
// File: src/components/professional-workspace/ProfessionalWorkspace.jsx

'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { usePathname } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { useIsMobile } from '@/primitives/use-mobile'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, User, RefreshCw, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
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

// Mobile Header Component - BORDERLESS
const MobileHeader = ({ onToggleSidebar, sidebarOpen }) => (
  <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card lg:hidden">
    <div className="flex items-center justify-between h-full px-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleSidebar}
        className="h-10 w-10 p-0"
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
          <span className="text-primary-foreground font-semibold text-sm">W</span>
        </div>
        <span className="font-semibold text-foreground">Workspace</span>
      </div>
      
      <div className="w-10" />
    </div>
  </header>
)

// Sidebar Backdrop Component
const SidebarBackdrop = ({ isVisible, onClick }) => {
  if (!isVisible) return null
  
  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-200"
      onClick={onClick}
      aria-hidden="true"
    />
  )
}

export default function ProfessionalWorkspace({ children }) {
  const { user, fetchUser, isLoading } = useUserStore()
  const session = useSession()
  const supabase = useSupabaseClient()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  
  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Desktop sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Animation state to prevent layout shift during initial load
  const [isInitialized, setIsInitialized] = useState(false)
  
  const [authState, setAuthState] = useState({
    isReady: false,
    error: null
  })
  
  const fetchAttempted = useRef(false)
  const authChecked = useRef(false)

  console.log('Professional Workspace render:', {
    hasSession: !!session,
    sessionUser: session?.user?.email,
    hasUser: !!user,
    userAccountId: user?.account?.account_id,
    isLoading,
    authState,
    isMobile,
    sidebarOpen,
    sidebarCollapsed
  })

  // Initialize and load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed')
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState))
    }
    // Prevent animation on initial load
    setTimeout(() => setIsInitialized(true), 100)
  }, [])

  // Save collapsed state to localStorage with smooth animation
  const toggleSidebarCollapsed = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
  }

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [pathname, isMobile])

  // Handle body scroll lock when mobile sidebar is open
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobile, sidebarOpen])

  // ONE-TIME authentication check
  useEffect(() => {
    if (authChecked.current) return
    authChecked.current = true
    
    console.log('One-time authentication check...')
    
    if (session?.user && user?.account?.account_id) {
      console.log('Already authenticated and user loaded')
      setAuthState({ isReady: true, error: null })
      return
    }
    
    if (session?.user) {
      console.log('Session found, waiting for user data...')
      setAuthState({ isReady: true, error: null })
      return
    }
    
    console.log('No session found')
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
    
    console.log('Fetching user data for:', session.user.email)
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

  // Mobile sidebar handlers
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  // Error state
  if (authState.error) {
    return (
      <SimpleError
        title="Authentication Error"
        description={authState.error}
        onRetry={handleRetry}
      />
    )
  }

  // Loading state - authentication check
  if (!authState.isReady || !session?.user) {
    return <SimpleLoading message="Checking authentication..." />
  }

  // Loading state - user data
  if (isLoading || !user?.account?.account_id) {
    return <SimpleLoading message="Loading your dashboard..." />
  }

  // Success! Render the responsive workspace
  console.log('Rendering workspace for:', user.account.email)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Header - BORDERLESS */}
      {isMobile && (
        <MobileHeader 
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
      )}

      {/* Sidebar Backdrop (Mobile Only) */}
      <SidebarBackdrop 
        isVisible={isMobile && sidebarOpen}
        onClick={closeSidebar}
      />

      <div className="flex h-screen overflow-hidden">
        {/* Responsive Sidebar - ENHANCED SMOOTH ANIMATIONS */}
        <aside
          className={cn(
            // Base styles - REMOVED borders + SMOOTH ANIMATIONS
            "flex-shrink-0 bg-card",
            // Smooth transition classes
            isInitialized && "transition-all duration-300 ease-in-out",
            // Desktop styles - Dynamic width based on collapsed state
            sidebarCollapsed ? "lg:w-16" : "lg:w-[185px]",
            "lg:relative lg:translate-x-0",
            // Mobile styles
            "fixed lg:relative z-50 lg:z-auto",
            "w-80 h-full",
            // Mobile positioning with smooth transitions
            isMobile 
              ? cn(
                  "transition-transform duration-300 ease-in-out",
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )
              : "translate-x-0"
          )}
        >
          <DashboardSidebar 
            isCollapsed={sidebarCollapsed}
            onToggleCollapsed={toggleSidebarCollapsed}
            isAnimating={isInitialized}
          />
        </aside>
        
        {/* Main Content - BORDERLESS CONTAINER with SMOOTH TRANSITIONS */}
        <main 
          className={cn(
            "flex-1 overflow-y-auto",
            // Smooth content reflow
            isInitialized && "transition-all duration-300 ease-in-out",
            // Add top padding on mobile for fixed header
            isMobile && "pt-16"
          )}
        >
          {/* BORDERLESS CONTAINER - Removed borders and constraints */}
          <div className="mx-auto p-6 space-y-6 max-w-7xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
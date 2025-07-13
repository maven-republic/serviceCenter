'use client'

import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { useSession } from '@supabase/auth-helpers-react'
import AnalyticsInterface from '@/components/professional-workspace/section/AnalyticsInterface'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  AlertCircle, 
  User, 
  Shield, 
  Plus, 
  Calendar,
  TrendingUp,
  Clock
} from "lucide-react"

// Modern loading component
const ModernLoadingState = ({ message = "Loading workspace..." }) => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="space-y-3">
      <Skeleton className="h-8 w-[300px]" />
      <Skeleton className="h-4 w-[500px]" />
    </div>
    
    {/* Quick actions skeleton */}
    <div className="flex items-center space-x-3">
      <Skeleton className="h-9 w-[120px]" />
      <Skeleton className="h-9 w-[140px]" />
    </div>
    
    {/* Content skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-[100px] mb-2" />
            <Skeleton className="h-8 w-[60px] mb-2" />
            <Skeleton className="h-3 w-[80px]" />
          </CardContent>
        </Card>
      ))}
    </div>
    
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center space-x-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    </div>
  </div>
)

// Modern error component
const ModernErrorState = ({ title, description, action }) => (
  <Alert variant="destructive" className="max-w-md mx-auto">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription className="space-y-3">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm mt-1">{description}</div>
      </div>
      {action && <div>{action}</div>}
    </AlertDescription>
  </Alert>
)

export default function WorkspaceInterface() {
  const { user } = useUserStore()
  const router = useRouter()
  const session = useSession()

  // Modern loading states
  if (session === null) {
    return <ModernLoadingState message="Checking authentication..." />
  }

  if (!user) {
    return <ModernLoadingState message="Loading user data..." />
  }

  // Role validation with modern error UI
  if (user?.primaryRole !== 'professional') {
    return (
      <ModernErrorState
        title="Access Denied"
        description="This workspace is only available to professional accounts."
        action={
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.replace('/login')}
            className="w-full"
          >
            <User className="mr-2 h-4 w-4" />
            Return to Login
          </Button>
        }
      />
    )
  }

  // Mock verification status - replace with real logic
  const isProfileComplete = true // user?.profile?.isComplete
  const hasActiveServices = true // user?.services?.length > 0

  return (
    <div className="space-y-6">
     
      {/* Profile completion reminder */}
      {!isProfileComplete && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <Shield className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Complete your profile verification to unlock all features.</span>
            <Button variant="outline" size="sm" className="ml-4 shrink-0">
              Complete Profile
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Analytics Interface */}
      <div className="space-y-6">
        <AnalyticsInterface />
      </div>
      
      {/* Development testing (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Development Mode</p>
              <Button variant="outline" size="sm">
                Test Component
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
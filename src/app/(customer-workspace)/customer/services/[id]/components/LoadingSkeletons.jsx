// File: src/app/(customer-workspace)/customer/services/[id]/components/LoadingSkeletons.jsx
// 💀 Loading skeletons for various page states

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Service Header Loading Skeleton
export function ServiceHeaderSkeleton() {
  return (
    <Card className="mb-4 sm:mb-6">
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="space-y-2 sm:space-y-3">
            <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
            <Skeleton className="h-3 sm:h-4 w-full max-w-xs sm:max-w-sm" />
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
              <Skeleton className="h-5 sm:h-6 w-20 sm:w-24" />
              <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
            <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

// Professionals Grid Loading Skeleton
export function ProfessionalsGridSkeleton({ 
  viewMode = 'grid', 
  isMobile = false,
  count 
}) {
  const itemCount = count || (isMobile ? 3 : 6)

  return (
    <div className={cn(
      "grid gap-4 sm:gap-6",
      viewMode === 'grid' 
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
        : "grid-cols-1"
    )}>
      {[...Array(itemCount)].map((_, i) => (
        <Card key={i} className={cn(
          "overflow-hidden",
          viewMode === 'grid' ? "h-72 sm:h-80" : "h-32 sm:h-40"
        )}>
          <CardHeader className="pb-2 sm:pb-4">
            <div className={cn(
              "flex gap-3",
              viewMode === 'list' ? "items-center" : "flex-col sm:flex-row sm:items-center"
            )}>
              <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0" />
              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
                <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
              </div>
              {viewMode === 'list' && (
                <Skeleton className="h-8 w-16 sm:w-20 flex-shrink-0" />
              )}
            </div>
          </CardHeader>
          {viewMode === 'grid' && (
            <CardContent className="space-y-2 sm:space-y-3">
              <Skeleton className="h-3 sm:h-4 w-full" />
              <Skeleton className="h-3 sm:h-4 w-3/4" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
                <Skeleton className="h-8 w-16 sm:w-20" />
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}

// User Loading State
export function UserLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] space-y-4">
      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
      <p className="text-sm sm:text-base text-muted-foreground">Loading your account...</p>
    </div>
  )
}

// Professionals Loading State with Header
export function ProfessionalsLoadingState({ viewMode = 'grid', isMobile = false }) {
  return (
    <div className="space-y-3 py-4 sm:py-0">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold">Available Professionals</h2>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
            Loading professionals...
          </span>
        </div>
      </div>
      <ProfessionalsGridSkeleton viewMode={viewMode} isMobile={isMobile} />
    </div>
  )
}

// Main Loading Skeletons Component (Default Export)
export default function LoadingSkeletons({ 
  type = 'professionals', // 'professionals' | 'user' | 'service' | 'grid'
  viewMode = 'grid', 
  isMobile = false,
  count
}) {
  switch (type) {
    case 'user':
      return <UserLoadingSkeleton />
    case 'service':
      return <ServiceHeaderSkeleton />
    case 'grid':
      return <ProfessionalsGridSkeleton viewMode={viewMode} isMobile={isMobile} count={count} />
    case 'professionals':
    default:
      return <ProfessionalsLoadingState viewMode={viewMode} isMobile={isMobile} />
  }
}
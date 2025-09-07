// src/components/professional-workspace/appointments/AppointmentLoadingState.jsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { 
  Skeleton, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonButton 
} from "@/components/ui/skeleton"
import { getColumnsForMode } from '@/components/professional-workspace/table/columns'
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'

// Enhanced Table Components with proper theming
const Table = ({ className, ...props }) => (
  <div className="relative w-full overflow-auto">
    <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
)

const TableHeader = ({ className, ...props }) => (
  <thead className={cn("border-b border-border", className)} {...props} />
)

const TableBody = ({ className, ...props }) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
)

const TableRow = ({ className, ...props }) => (
  <tr className={cn(
    "border-b border-border/40 transition-colors last:border-b-0 hover:bg-muted/30", 
    className
  )} {...props} />
)

const TableHead = ({ className, ...props }) => (
  <th className={cn(
    "h-10 px-3 text-left align-middle font-medium text-muted-foreground", 
    className
  )} {...props} />
)

const TableCell = ({ className, ...props }) => (
  <td className={cn("px-3 py-2 align-middle", className)} {...props} />
)

// Sophisticated skeleton cell components that match real data patterns
const SkeletonCells = {
  selection: () => (
    <TableCell className="w-8">
      <Skeleton className="h-4 w-4" variant="subtle" />
    </TableCell>
  ),

  type: () => (
    <TableCell className="w-12">
      <Skeleton className="h-5 w-12 rounded-full" variant="light" shimmer />
    </TableCell>
  ),

  customer: ({ delay = 0 }) => (
    <TableCell>
      <div className="flex items-center space-x-2">
        <SkeletonAvatar size="sm" className="flex-shrink-0" speed="slow" />
        <div className="min-w-0 flex-1 space-y-1">
          <Skeleton 
            className="h-3 w-24" 
            speed="normal"
            style={{ animationDelay: `${delay * 100}ms` }}
          />
          <div className="hidden sm:block">
            <Skeleton 
              className="h-2 w-20" 
              variant="subtle"
              speed="fast"
              style={{ animationDelay: `${delay * 150}ms` }}
            />
          </div>
        </div>
      </div>
    </TableCell>
  ),

  service: ({ delay = 0 }) => (
    <TableCell>
      <div className="min-w-0 space-y-1">
        <Skeleton 
          className="h-3 w-32" 
          shimmer
          style={{ animationDelay: `${delay * 120}ms` }}
        />
        <Skeleton 
          className="h-2 w-24" 
          variant="subtle"
          speed="slow"
          style={{ animationDelay: `${delay * 200}ms` }}
        />
      </div>
    </TableCell>
  ),

  time: ({ delay = 0 }) => (
    <TableCell>
      <div className="space-y-1">
        <Skeleton 
          className="h-3 w-20" 
          variant="light"
          style={{ animationDelay: `${delay * 80}ms` }}
        />
        <Skeleton 
          className="h-2 w-16" 
          variant="subtle"
          speed="fast"
          style={{ animationDelay: `${delay * 180}ms` }}
        />
      </div>
    </TableCell>
  ),

  status: ({ delay = 0 }) => (
    <TableCell>
      <div className="w-fit">
        <div className="flex items-center gap-2">
          <Skeleton 
            className="w-2 h-2 rounded-full" 
            variant="light"
            speed="slow"
            style={{ animationDelay: `${delay * 90}ms` }}
          />
          <Skeleton 
            className="h-5 w-16 rounded-full" 
            shimmer
            style={{ animationDelay: `${delay * 110}ms` }}
          />
        </div>
      </div>
    </TableCell>
  ),

  attachments: ({ delay = 0 }) => (
    <TableCell className="w-12">
      <div className="flex items-center space-x-1">
        <Skeleton 
          className="h-4 w-4" 
          variant="subtle"
          style={{ animationDelay: `${delay * 160}ms` }}
        />
        <Skeleton 
          className="h-3 w-3" 
          variant="light"
          speed="fast"
          style={{ animationDelay: `${delay * 190}ms` }}
        />
      </div>
    </TableCell>
  ),

  date: ({ delay = 0 }) => (
    <TableCell>
      <Skeleton 
        className="h-3 w-16" 
        variant="subtle"
        style={{ animationDelay: `${delay * 140}ms` }}
      />
    </TableCell>
  ),

  actions: () => (
    <TableCell className="w-12 text-right">
      <Skeleton className="h-7 w-7 ml-auto rounded" variant="light" />
    </TableCell>
  )
}

// Mobile Card Skeleton Component with realistic patterns
const MobileCardSkeleton = ({ mode, index = 0 }) => {
  const baseDelay = index * 100 // Stagger animation for each card
  
  return (
    <Card className={cn(
      "border-l-4 transition-all duration-300",
      mode === 'available' && "border-l-blue-200",
      mode === 'interests' && "border-l-purple-200", 
      mode === 'assigned' && "border-l-green-200"
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with customer and type */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <SkeletonAvatar 
                size="sm" 
                speed="normal"
                style={{ animationDelay: `${baseDelay}ms` }}
              />
              <div className="min-w-0 flex-1">
                <Skeleton 
                  className="h-4 w-32 mb-2" 
                  shimmer
                  style={{ animationDelay: `${baseDelay + 50}ms` }}
                />
                <Skeleton 
                  className="h-3 w-24" 
                  variant="subtle"
                  style={{ animationDelay: `${baseDelay + 100}ms` }}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-3">
              {mode === 'available' && (
                <Skeleton 
                  className="h-5 w-16 rounded-full" 
                  variant="light" 
                  shimmer
                  style={{ animationDelay: `${baseDelay + 150}ms` }}
                />
              )}
              <Skeleton 
                className="h-5 w-20 rounded-full" 
                style={{ animationDelay: `${baseDelay + 200}ms` }}
              />
            </div>
          </div>
          
          {/* Service name */}
          <div>
            <Skeleton 
              className="h-4 w-40 mb-1" 
              variant="light"
              style={{ animationDelay: `${baseDelay + 250}ms` }}
            />
          </div>
          
          {/* Time and urgency */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Skeleton 
                className="h-4 w-4 rounded-full" 
                variant="subtle"
                style={{ animationDelay: `${baseDelay + 300}ms` }}
              />
              <Skeleton 
                className="h-3 w-24" 
                style={{ animationDelay: `${baseDelay + 350}ms` }}
              />
            </div>
            <Skeleton 
              className="h-4 w-16 rounded-full" 
              variant="light"
              shimmer
              style={{ animationDelay: `${baseDelay + 400}ms` }}
            />
          </div>
          
          {/* Description preview */}
          <div className="space-y-1">
            <Skeleton 
              className="h-3 w-full" 
              variant="subtle"
              speed="slow"
              style={{ animationDelay: `${baseDelay + 450}ms` }}
            />
            <Skeleton 
              className="h-3 w-3/4" 
              variant="subtle"
              speed="slow"
              style={{ animationDelay: `${baseDelay + 500}ms` }}
            />
          </div>
          
          {/* Mode-specific content areas */}
          {mode === 'interests' && (
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
              <div className="flex items-center justify-between">
                <Skeleton 
                  className="h-3 w-20" 
                  variant="light"
                  style={{ animationDelay: `${baseDelay + 550}ms` }}
                />
                <Skeleton 
                  className="h-3 w-24" 
                  variant="light"
                  style={{ animationDelay: `${baseDelay + 600}ms` }}
                />
              </div>
            </div>
          )}
          
          {mode === 'available' && (
            <div className="bg-orange-50 p-2 rounded border border-orange-100">
              <div className="flex items-center gap-2">
                <Skeleton 
                  className="h-3 w-3 rounded-full" 
                  variant="light"
                  style={{ animationDelay: `${baseDelay + 550}ms` }}
                />
                <Skeleton 
                  className="h-3 w-32" 
                  style={{ animationDelay: `${baseDelay + 600}ms` }}
                />
              </div>
            </div>
          )}

          {mode === 'assigned' && (
            <div className="bg-green-50 p-2 rounded border border-green-100">
              <div className="flex items-center justify-between">
                <Skeleton 
                  className="h-3 w-16" 
                  variant="light"
                  style={{ animationDelay: `${baseDelay + 550}ms` }}
                />
                <Skeleton 
                  className="h-3 w-20" 
                  style={{ animationDelay: `${baseDelay + 600}ms` }}
                />
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="pt-2">
            {mode === 'assigned' ? (
              <div className="flex gap-2">
                <SkeletonButton 
                  size="sm" 
                  className="flex-1 h-8"
                  variant="light"
                  style={{ animationDelay: `${baseDelay + 650}ms` }}
                />
                <SkeletonButton 
                  size="sm" 
                  className="flex-1 h-8"
                  variant="subtle"
                  style={{ animationDelay: `${baseDelay + 700}ms` }}
                />
              </div>
            ) : (
              <SkeletonButton 
                className="w-full h-8"
                shimmer
                style={{ animationDelay: `${baseDelay + 650}ms` }}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Desktop Table Skeleton with proper column mapping
const DesktopTableSkeletonView = ({ mode, rowCount = 5 }) => {
  const columns = getColumnsForMode(mode)
  const skeletonRows = Array.from({ length: Math.min(rowCount, 8) }, (_, index) => index)

  const renderSkeletonHeader = (column) => {
    return (
      <TableHead key={column.key} className={cn("py-3", column.width || '')}>
        {column.key === 'selection' ? (
          <Skeleton className="h-4 w-4" variant="subtle" />
        ) : column.header ? (
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" variant="light" />
            {column.sortable !== false && (
              <Skeleton className="h-3 w-3" variant="subtle" speed="fast" />
            )}
          </div>
        ) : null}
      </TableHead>
    )
  }

  const renderSkeletonCell = (column, rowIndex) => {
    const SkeletonComponent = SkeletonCells[column.key]
    return SkeletonComponent 
      ? <SkeletonComponent key={column.key} delay={rowIndex} />
      : <TableCell key={column.key}><Skeleton className="h-4 w-20" /></TableCell>
  }

  return (
    <Card className="w-full bg-card border-border">
      {/* Enhanced Header */}
      <CardHeader className="flex-shrink-0 bg-muted/20 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-6 w-48" shimmer />
            <Skeleton className="h-5 w-20 rounded-full" variant="light" />
            <Skeleton className="h-5 w-16 rounded-full" variant="subtle" />
          </div>
          <div className="flex items-center space-x-2">
            <SkeletonButton size="sm" className="h-8 w-24" variant="light" />
            <SkeletonButton size="sm" className="h-8 w-8" variant="subtle" />
          </div>
        </div>
      </CardHeader>

      {/* Table content with staggered animations */}
      <CardContent className="p-0 flex-1 bg-background">
        <div className="border-0 rounded-none max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border">
              <TableRow className="hover:bg-transparent border-b border-border">
                {columns.map(renderSkeletonHeader)}
              </TableRow>
            </TableHeader>

            <TableBody>
              {skeletonRows.map((_, rowIndex) => (
                <TableRow 
                  key={rowIndex}
                  className="h-12 border-b border-border/40"
                  style={{ 
                    animationDelay: `${rowIndex * 50}ms`,
                    opacity: 0.4 + (rowIndex * 0.1) // Subtle depth effect
                  }}
                >
                  {columns.map(column => renderSkeletonCell(column, rowIndex))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Enhanced Footer pagination skeleton */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-32" variant="subtle" />
          <Skeleton className="h-5 w-24 rounded-full" variant="light" />
        </div>
        <div className="flex items-center space-x-2">
          <SkeletonButton size="sm" className="h-8 w-16" variant="light" />
          <div className="flex items-center space-x-1">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton 
                key={i} 
                className="h-8 w-8 rounded" 
                variant={i === 1 ? "default" : "subtle"}
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
          <SkeletonButton size="sm" className="h-8 w-16" variant="light" />
        </div>
      </div>
    </Card>
  )
}

// Main responsive component with enhanced responsive detection
export function AppointmentLoadingState({ 
  mode = 'available',
  rowCount = 5,
  viewMode = 'auto', // 'cards', 'table', or 'auto'
  className = '',
  shimmerEffect = true
}) {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Enhanced mobile detection
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    // Simulate realistic loading time
    const timer = setTimeout(() => setIsLoading(true), 100)
    
    return () => {
      window.removeEventListener('resize', checkIsMobile)
      clearTimeout(timer)
    }
  }, [])

  // Determine view based on screen size and viewMode
  const shouldShowCards = viewMode === 'cards' || 
    (viewMode === 'auto' && isMobile) ||
    (viewMode !== 'table' && isMobile)

  const cardCount = Math.min(rowCount, 6) // Limit cards for performance

  if (shouldShowCards) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: cardCount }, (_, index) => (
          <MobileCardSkeleton 
            key={index} 
            mode={mode} 
            index={index}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      <DesktopTableSkeletonView 
        mode={mode} 
        rowCount={rowCount} 
      />
    </div>
  )
}

export default AppointmentLoadingState
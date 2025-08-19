// src/components/professional-workspace/appointments/AppointmentLoadingState.jsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getColumnsForMode } from '@/components/professional-workspace/table/columns'

// Import the same table components as the real table
const Table = ({ className, ...props }) => (
  <div className="relative w-full overflow-auto">
    <table className="w-full caption-bottom text-sm" {...props} />
  </div>
)

const TableHeader = ({ className, ...props }) => (
  <thead className="[&_tr]:border-b" {...props} />
)

const TableBody = ({ className, ...props }) => (
  <tbody className="[&_tr:last-child]:border-0" {...props} />
)

const TableRow = ({ className, ...props }) => (
  <tr className="border-b transition-colors hover:bg-muted/50" {...props} />
)

const TableHead = ({ className, ...props }) => (
  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0" {...props} />
)

const TableCell = ({ className, ...props }) => (
  <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0" {...props} />
)

// Mobile Card Skeleton Component
const MobileCardSkeleton = ({ mode }) => {
  return (
    <Card className="border-l-4 border-l-primary/20">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
            
            <div className="flex items-center gap-2 ml-3">
              {mode === 'available' && (
                <Skeleton className="h-5 w-16 rounded-full" />
              )}
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          
          {/* Time and urgency */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          
          {/* Description preview */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          
          {/* Interest-specific info for interests mode */}
          {mode === 'interests' && (
            <div className="bg-green-50 p-2 rounded">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          )}
          
          {/* Competition indicator for available mode */}
          {mode === 'available' && (
            <div className="bg-orange-50 p-2 rounded">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          )}
          
          {/* Action button */}
          <div className="pt-2">
            {mode === 'assigned' ? (
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1 rounded-md" />
                <Skeleton className="h-8 flex-1 rounded-md" />
              </div>
            ) : (
              <Skeleton className="h-8 w-full rounded-md" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Mobile Cards Container Skeleton
const MobileCardsSkeletonView = ({ mode, cardCount = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: cardCount }, (_, index) => (
        <MobileCardSkeleton key={index} mode={mode} />
      ))}
    </div>
  )
}

// Desktop Table Skeleton (your existing table logic)
const DesktopTableSkeletonView = ({ mode, rowCount = 5 }) => {
  const columns = getColumnsForMode(mode)
  const skeletonRows = Array.from({ length: Math.min(rowCount, 8) }, (_, index) => index)

  const renderSkeletonCell = (column) => {
    switch (column.key) {
      case 'selection':
        return (
          <TableCell key={column.key} className="w-8">
            <Skeleton className="h-3 w-3" />
          </TableCell>
        )
        
      case 'type':
        return (
          <TableCell key={column.key} className="w-12">
            <Skeleton className="h-4 w-12 rounded-full" />
          </TableCell>
        )
        
      case 'customer':
        return (
          <TableCell key={column.key}>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3 w-24 mb-1" />
                <div className="hidden sm:block">
                  <Skeleton className="h-2 w-20" />
                </div>
              </div>
            </div>
          </TableCell>
        )
        
      case 'service':
        return (
          <TableCell key={column.key}>
            <div className="min-w-0">
              <Skeleton className="h-3 w-32 mb-1" />
              <Skeleton className="h-2 w-24" />
            </div>
          </TableCell>
        )
        
      case 'time':
        return (
          <TableCell key={column.key}>
            <div>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-2 w-16" />
            </div>
          </TableCell>
        )
        
      case 'status':
        return (
          <TableCell key={column.key}>
            <div className="w-fit">
              <div className="flex items-center gap-1">
                <Skeleton className="w-1.5 h-1.5 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            </div>
          </TableCell>
        )
        
      case 'attachments':
        return (
          <TableCell key={column.key} className="w-12">
            <div className="flex items-center space-x-1">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-2 w-2" />
            </div>
          </TableCell>
        )
        
      case 'date':
        return (
          <TableCell key={column.key}>
            <Skeleton className="h-3 w-16" />
          </TableCell>
        )
        
      case 'actions':
        return (
          <TableCell key={column.key} className="w-12 text-right">
            <Skeleton className="h-6 w-6 ml-auto" />
          </TableCell>
        )
        
      default:
        return (
          <TableCell key={column.key}>
            <Skeleton className="h-4 w-20" />
          </TableCell>
        )
    }
  }

  const renderSkeletonHeader = (column) => {
    return (
      <TableHead key={column.key} className={`py-2 ${column.width || ''}`}>
        {column.key === 'selection' ? (
          <Skeleton className="h-3 w-3" />
        ) : column.header ? (
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-12" />
            {column.sortable !== false && (
              <Skeleton className="h-3 w-3" />
            )}
          </div>
        ) : null}
      </TableHead>
    )
  }

  return (
    <Card className="w-full bg-card border-border">
      {/* Header matching the real table header */}
      <CardHeader className="flex-shrink-0 bg-muted/30 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-24 rounded" />
          </div>
        </div>
      </CardHeader>

      {/* Table content */}
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
                  className="h-12 border-b border-border"
                >
                  {columns.map(renderSkeletonCell)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Footer pagination skeleton */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-16" />
          <div className="flex items-center space-x-1">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-8" />
            ))}
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </Card>
  )
}

// Main responsive component
export function AppointmentLoadingState({ 
  mode = 'available',
  rowCount = 5,
  viewMode = 'cards', // 'cards' or 'table'
  className = ''
}) {
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile viewport
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Show mobile cards view for mobile devices or when viewMode is 'cards'
  const shouldShowCards = isMobile || viewMode === 'cards'

  if (shouldShowCards) {
    return (
      <div className={className}>
        <MobileCardsSkeletonView 
          mode={mode} 
          cardCount={rowCount} 
        />
      </div>
    )
  }

  // Show desktop table view
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
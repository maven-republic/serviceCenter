// src/components/professional-workspace/appointments/AppointmentLoadingState.jsx
'use client'

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

export function AppointmentLoadingState({ 
  mode = 'available',
  rowCount = 5 
}) {
  // Get the exact column configuration for the current mode
  const columns = getColumnsForMode(mode)
  
  // Generate skeleton rows based on expected page size
  const skeletonRows = Array.from({ length: Math.min(rowCount, 8) }, (_, index) => index)

  // Skeleton cell renderers that match real cell content
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

  // Skeleton header that matches real headers
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

      {/* Table content matching the real table structure */}
      <CardContent className="p-0 flex-1 bg-background">
        <div className="border-0 rounded-none max-h-[600px] overflow-y-auto">
          <Table>
            {/* Table header with skeleton column headers */}
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border">
              <TableRow className="hover:bg-transparent border-b border-border">
                {columns.map(renderSkeletonHeader)}
              </TableRow>
            </TableHeader>

            {/* Table body with skeleton rows */}
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

      {/* Footer matching pagination area (optional - only show if you want to simulate pagination) */}
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

export default AppointmentLoadingState
// src/components/professional-workspace/table/AppointmentInformationTable.jsx
'use client'

import { useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TooltipProvider,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings,
  MessageSquare,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

// Import our primitive hooks
import { useTableSelection } from './primitives/useTableSelection'
import { useTableSorting } from './primitives/useTableSorting'
import { useTableData } from './primitives/useTableData'

// Import our column definitions
import { getColumnsForMode } from './columns'

// Minimal Table components with clean design
const Table = ({ className, ...props }) => (
  <div className="relative w-full overflow-auto">
    <table
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
)

const TableHeader = ({ className, ...props }) => (
  <thead className={cn("border-b", className)} {...props} />
)

const TableBody = ({ className, ...props }) => (
  <tbody className={className} {...props} />
)

const TableRow = ({ className, ...props }) => (
  <tr
    className={cn(
      "border-b border-border/40 hover:bg-muted/30 transition-colors last:border-b-0",
      className
    )}
    {...props}
  />
)

const TableHead = ({ className, ...props }) => (
  <th
    className={cn(
      "h-10 px-3 text-left align-middle font-medium text-muted-foreground",
      className
    )}
    {...props}
  />
)

const TableCell = ({ className, ...props }) => (
  <td
    className={cn(
      "px-3 py-2 align-middle",
      className
    )}
    {...props}
  />
)

// Main component
export default function AppointmentInformationTable({
  appointments = [],
  professionalId,
  professional,
  onView,
  onAccept,
  onDecline,
  onExpressInterest,
  onUpdateInterest,
  onViewAttachments,
  onRefresh,
  loading = false,
  pagination: externalPagination,
  onPageChange: externalPageChange,
  mode = 'available', // 'available', 'interests', 'assigned'
  searchQuery = '',
  filters = {},
  onSearchChange,
  onFilterChange,
  className,
  ...props
}) {
  // ===== PRIMITIVE HOOKS =====
  
  // Data management with search, filtering, and pagination
  const {
    processedData,
    filteredData,
    paginationInfo,
    handleSearch,
    handleFilter,
    goToPage,
    dataStats,
    clearAllFilters
  } = useTableData({
    data: appointments,
    mode,
    pageSize: externalPagination?.pageSize || 10,
    searchableFields: ['customer', 'service', 'description'],
    filterableFields: ['status', 'urgency', 'type']
  })

  // Sorting management
  const {
    sortedData,
    sortConfig,
    handleSort,
    getSortIcon,
    clearSort
  } = useTableSorting({
    data: processedData,
    columns: getColumnsForMode(mode),
    defaultSort: { key: 'created_at', direction: 'desc' },
    mode
  })

  // Selection management
  const {
    selection,
    selectedItems,
    selectionState,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isSelected,
    bulkOperations
  } = useTableSelection({
    data: sortedData,
    mode,
    getItemId: (item) => mode === 'interests' ? item.appointment?.appointment_id : item.appointment_id
  })

  // ===== COMPUTED VALUES =====
  const columns = getColumnsForMode(mode)
  
  // Get table title based on mode
  const getTableTitle = () => {
    switch (mode) {
      case 'available':
        return 'Available Appointments'
      case 'interests':
        return 'My Interests'
      case 'assigned':
        return 'Assigned Appointments'
      default:
        return 'Appointments Overview'
    }
  }

  // Use external pagination if provided, otherwise use internal
  const activePagination = externalPagination || paginationInfo
  const activePageChange = externalPageChange || goToPage

  // ===== ACTION HANDLERS =====
  const handleAction = useCallback(async (actionType, item) => {
    try {
      switch (actionType) {
        case 'express_interest':
          await onExpressInterest?.(item.appointment_id, { intent: item.is_invited ? 'high' : 'standard' })
          break
        case 'respond_to_selection':
          // Open professional response handler
          onView?.(item.appointment?.appointment_id)
          break
        case 'update_interest':
          await onUpdateInterest?.(item.interest_id)
          break
        case 'reapply':
          await onExpressInterest?.(item.appointment?.appointment_id, { intent: 'standard' })
          break
        case 'accept':
          await onAccept?.(item.appointment_id)
          break
        case 'decline':
          await onDecline?.(item.appointment_id)
          break
        case 'share':
          // Handle share functionality
          console.log('Share:', item)
          break
        default:
          console.warn('Unknown action:', actionType)
      }
      
      // Refresh data after successful action
      onRefresh?.()
    } catch (error) {
      console.error('Action failed:', actionType, error)
    }
  }, [onExpressInterest, onView, onUpdateInterest, onAccept, onDecline, onRefresh])

  const handleRowClick = useCallback((item) => {
    const appointmentId = mode === 'interests' ? item.appointment?.appointment_id : item.appointment_id
    
    if (mode === 'interests') {
      console.log('🎯 Interests mode click - passing complete interest data:', {
        appointmentId,
        interestStatus: item.status,
        interestId: item.interest_id
      });
      
      onView?.(appointmentId, {
        mode: 'interests',
        interestData: item,
        appointmentData: item.appointment
      })
    } else {
      onView?.(appointmentId)
    }
  }, [mode, onView])

  const handleBulkMessage = useCallback(() => {
    const selectedIds = bulkOperations.getSelectedIds()
    console.log('Bulk message:', selectedIds)
    // Implement bulk messaging
    // You can access full selected items with: selectedItems
  }, [bulkOperations, selectedItems])

  const handleBulkArchive = useCallback(() => {
    const selectedIds = bulkOperations.getSelectedIds()
    console.log('Bulk archive:', selectedIds)
    // Implement bulk archiving
    // You can access full selected items with: selectedItems
  }, [bulkOperations, selectedItems])

  const handleCustomize = useCallback(() => {
    console.log('Customize table')
    // Implement table customization
  }, [])

  // ===== RENDER HELPERS =====
  const renderColumnHeader = (column) => {
    const isSortable = column.sortable !== false
    const sortIconData = getSortIcon(column.key)
    
    return (
      <TableHead key={column.key} className={cn("", column.width, column.headerClassName)}>
        {column.key === 'selection' ? (
          // Special handling for selection header
          column.headerCell?.({
            selectedCount: selectionState.selectedCount,
            totalCount: selectionState.totalCount,
            onSelectAll: toggleSelectAll
          }) || null
        ) : (
          <div
            className={cn(
              "flex items-center gap-1 text-left font-medium select-none cursor-default",
              isSortable && "hover:text-foreground cursor-pointer"
            )}
            onClick={isSortable ? () => handleSort(column.key) : undefined}
          >
            <span className="text-sm font-medium">{column.header}</span>
            {isSortable && (
              sortIconData.icon === 'asc' ? <ArrowUp className="h-3 w-3" /> :
              sortIconData.icon === 'desc' ? <ArrowDown className="h-3 w-3" /> :
              <ArrowUpDown className="h-3 w-3 opacity-50" />
            )}
          </div>
        )}
      </TableHead>
    )
  }

  const renderCell = (item, column) => {
    const appointmentId = mode === 'interests' ? item.appointment?.appointment_id : item.appointment_id
    const itemIsSelected = isSelected(appointmentId)
    
    // Special handling for selection cell
    if (column.key === 'selection') {
      return (
        <TableCell key={column.key} className={cn("", column.cellClassName)} onClick={(e) => e.stopPropagation()}>
          {column.cell({
            item,
            isSelected: itemIsSelected,
            onToggle: () => toggleSelection(appointmentId)
          })}
        </TableCell>
      )
    }

    // Handle other cells
    const value = column.accessorFn ? column.accessorFn(item, mode) : item[column.accessorKey]
    
    return (
      <TableCell key={column.key} className={cn("", column.width, column.cellClassName)}>
        {column.cell({
          item,
          value,
          mode,
          onAction: handleAction,
          onViewAttachments
        })}
      </TableCell>
    )
  }

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <Card className={cn("w-full border-0 shadow-none", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 py-2 px-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // ===== EMPTY STATE =====
  if (sortedData.length === 0) {
    const emptyMessages = {
      available: {
        title: 'No available appointments',
        description: 'There are currently no appointment opportunities in your area. Check back later for new opportunities and invitations.'
      },
      interests: {
        title: 'No interests expressed',
        description: 'You haven\'t expressed interest in any appointments yet. Browse available appointments to get started.'
      },
      assigned: {
        title: 'No assigned appointments',
        description: 'You don\'t have any assigned appointments yet. Express interest in available appointments to get selected by customers.'
      }
    }

    const message = emptyMessages[mode] || emptyMessages.assigned

    // Check if it's filtered empty vs truly empty
    const isFiltered = dataStats.hasActiveFilters
    const actualTitle = isFiltered ? `No ${mode} appointments match your filters` : message.title
    const actualDescription = isFiltered 
      ? `Found ${dataStats.total} total appointments, but none match your current search or filters. Try adjusting your criteria.`
      : message.description

    return (
      <Card className={cn("border-0 shadow-none", className)}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-8 w-8 text-muted-foreground mb-3" />
          <h3 className="font-medium mb-2">{actualTitle}</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
            {actualDescription}
          </p>
          {isFiltered && (
            <Button 
              variant="outline" 
              onClick={clearAllFilters}
              size="sm"
            >
              Clear all filters
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // Filter out invalid props before passing to Card component
  const {
    selectionState: _selectionState,
    onSelectionChange: _onSelectionChange,
    onSelectAll: _onSelectAll,
    ...cardProps
  } = props

  // ===== MAIN RENDER =====
  return (
    <TooltipProvider>
      <Card className={cn("w-full border-0 shadow-none", className)} {...cardProps}>
        {/* Minimal Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="font-medium">{getTableTitle()}</h3>
              
              {/* Selection Badge */}
              {selectionState.hasSelection && (
                <Badge variant="secondary" className="text-xs">
                  {selectionState.selectedCount} selected
                </Badge>
              )}
              
              {/* Filter Badge */}
              {dataStats.hasActiveFilters && (
                <Badge variant="outline" className="text-xs">
                  {dataStats.filtered} of {dataStats.total}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Bulk Actions - Minimal */}
              {selectionState.hasSelection && (
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleBulkMessage}
                    className="h-7 px-2"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleBulkArchive}
                    className="h-7 px-2 text-muted-foreground"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Archive
                  </Button>
                </div>
              )}
              
              {/* Settings */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCustomize}
                className="h-7 w-7 p-0"
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Table Content */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {columns.map(renderColumnHeader)}
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedData.map((item) => {
                  const appointmentId = mode === 'interests' ? item.appointment?.appointment_id : item.appointment_id
                  const itemIsSelected = isSelected(appointmentId)
                  
                  if (!appointmentId) {
                    console.warn('⚠️ Skipping item without appointment_id:', item)
                    return null
                  }
                  
                  return (
                    <TableRow 
                      key={appointmentId}
                      className={cn(
                        "cursor-pointer",
                        itemIsSelected && "bg-muted/40"
                      )}
                      onClick={() => handleRowClick(item)}
                    >
                      {columns.map(column => renderCell(item, column))}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Minimal Pagination */}
        {activePagination && activePagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-border/40">
            <div className="text-sm text-muted-foreground">
              {activePagination.startIndex}–{activePagination.endIndex} of {activePagination.totalItems}
              {selectionState.hasSelection && (
                <span className="ml-2 font-medium">
                  • {selectionState.selectedCount} selected
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => activePageChange(activePagination.currentPage - 1)}
                disabled={!activePagination.hasPreviousPage}
                className="h-7 px-2"
              >
                <ChevronLeft className="h-3 w-3" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: activePagination.totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    const current = activePagination.currentPage
                    return page === 1 || 
                           page === activePagination.totalPages || 
                           (page >= current - 1 && page <= current + 1)
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-1 text-muted-foreground text-sm">…</span>
                      )}
                      <Button
                        variant={page === activePagination.currentPage ? "default" : "ghost"}
                        size="sm"
                        onClick={() => activePageChange(page)}
                        className="w-7 h-7 p-0 text-sm"
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => activePageChange(activePagination.currentPage + 1)}
                disabled={!activePagination.hasNextPage}
                className="h-7 px-2"
              >
                Next
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </TooltipProvider>
  )
}
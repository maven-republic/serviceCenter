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

// Ultra-flat Table components with thin borders
const Table = ({ className, ...props }) => (
  <div className="relative w-full overflow-auto">
    <table
      className={cn("w-full caption-bottom text-sm border-collapse border-spacing-0", className)}
      {...props}
    />
  </div>
)

const TableHeader = ({ className, ...props }) => (
  <thead className={cn("", className)} {...props} />
)

const TableBody = ({ className, ...props }) => (
  <tbody className={cn("", className)} {...props} />
)

const TableRow = ({ className, ...props }) => (
  <tr
    className={cn(
      "border-b border-gray-50 hover:bg-gray-50",
      className
    )}
    {...props}
  />
)

const TableHead = ({ className, ...props }) => (
  <th
    className={cn(
      "h-11 px-3 text-left align-middle font-medium text-gray-600 bg-gray-50 border-b border-gray-100",
      className
    )}
    {...props}
  />
)

const TableCell = ({ className, ...props }) => (
  <td
    className={cn(
      "p-3 align-middle text-gray-900",
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
              "flex items-center gap-1 text-left font-medium text-gray-600 select-none cursor-default",
              isSortable && "hover:text-gray-900 cursor-pointer"
            )}
            onClick={isSortable ? () => handleSort(column.key) : undefined}
          >
            <span className="text-sm font-medium">{column.header}</span>
            {isSortable && (
              sortIconData.icon === 'asc' ? <ArrowUp className="h-3 w-3 text-gray-900" /> :
              sortIconData.icon === 'desc' ? <ArrowDown className="h-3 w-3 text-gray-900" /> :
              <ArrowUpDown className="h-3 w-3 text-gray-400" />
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
      <Card className={cn("w-full border border-gray-200", className)}>
        <CardHeader className="py-3 px-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32 bg-gray-200" />
            <Skeleton className="h-8 w-24 bg-gray-200" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-3 border-b border-gray-50 last:border-b-0">
                <Skeleton className="h-4 w-4 bg-gray-200" />
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full bg-gray-200" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32 bg-gray-200" />
                    <Skeleton className="h-3 w-24 bg-gray-200" />
                  </div>
                </div>
                <Skeleton className="h-4 w-24 bg-gray-200" />
                <Skeleton className="h-4 w-32 bg-gray-200" />
                <Skeleton className="h-5 w-16 bg-gray-200" />
                <Skeleton className="h-4 w-16 bg-gray-200" />
                <Skeleton className="h-4 w-24 bg-gray-200" />
                <Skeleton className="h-6 w-6 bg-gray-200" />
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
      <Card className={cn("border border-gray-100 shadow-none", className)}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-gray-900">{actualTitle}</h3>
          <p className="text-gray-600 text-center max-w-md mb-4">
            {actualDescription}
          </p>
          {isFiltered && (
            <Button 
              variant="outline" 
              onClick={clearAllFilters}
              className="border-gray-300 text-gray-700"
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
      <Card className={cn("w-full border border-gray-100 shadow-none", className)} {...cardProps}>
        {/* Flat Header */}
        <CardHeader className="py-3 px-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-base font-medium text-gray-900">{getTableTitle()}</h3>
              
              {/* Selection Badge */}
              {selectionState.hasSelection && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {selectionState.selectedCount} of {selectionState.totalCount} selected
                </Badge>
              )}
              
              {/* Data Stats Badge */}
              {dataStats.hasActiveFilters && (
                <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                  {dataStats.filtered} of {dataStats.total} shown
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Bulk Actions */}
              {selectionState.hasSelection && (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBulkMessage}
                    className="border-gray-300 text-gray-700"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message ({selectionState.selectedCount})
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBulkArchive}
                    className="border-gray-300 text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Archive ({selectionState.selectedCount})
                  </Button>
                </div>
              )}
              
              {/* Customize Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCustomize}
                className="border-gray-300 text-gray-700"
              >
                <Settings className="h-4 w-4 mr-1" />
                Customize
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Flat Table Content */}
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-50 z-10">
                <TableRow className="border-b border-gray-100">
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
                        "h-12 cursor-pointer border-b border-gray-50",
                        itemIsSelected && "bg-blue-50 border-l border-l-blue-500"
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

        {/* Flat Pagination */}
        {activePagination && activePagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>
                Showing {activePagination.startIndex} to {activePagination.endIndex} of {activePagination.totalItems} results
              </span>
              
              {/* Selection Summary */}
              {selectionState.hasSelection && (
                <span className="text-blue-600 font-medium">
                  {selectionState.selectedCount} selected
                </span>
              )}
              
              {/* Filter Summary */}
              {dataStats.hasActiveFilters && (
                <span className="text-orange-600">
                  Filtered ({dataStats.filterEfficiency}% match)
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => activePageChange(activePagination.currentPage - 1)}
                disabled={!activePagination.hasPreviousPage}
                className="border-gray-300 text-gray-700"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
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
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <Button
                        variant={page === activePagination.currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => activePageChange(page)}
                        className={cn(
                          "w-8 h-8 p-0",
                          page === activePagination.currentPage 
                            ? "bg-blue-600 text-white border-blue-600" 
                            : "border-gray-300 text-gray-700"
                        )}
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => activePageChange(activePagination.currentPage + 1)}
                disabled={!activePagination.hasNextPage}
                className="border-gray-300 text-gray-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </TooltipProvider>
  )
}
// src/components/professional-workspace/appointments/AppointmentPagination.jsx
'use client'

import { useMemo, useCallback } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal,
  Eye,
  Download,
  Settings,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'

export default function AppointmentPagination({ 
  pagination,
  onPageChange,
  onPageSizeChange,
  selectionState, // From useTableSelection hook
  dataStats, // From useTableData hook
  mode = 'available',
  showPageSizeSelector = true,
  showQuickJump = true,
  showDataStats = true,
  showBulkActions = true,
  onExport,
  onBulkAction,
  className,
  ...props 
}) {
  // ===== SAFETY CHECKS =====
  if (!pagination || !pagination.totalPages || pagination.totalPages <= 1) {
    // Still show info if we have selection or data stats
    const hasInfo = (selectionState?.hasSelection) || (dataStats?.hasActiveFilters) || showDataStats
    if (!hasInfo) return null
  }

  // ===== COMPUTED VALUES =====
  const { 
    currentPage = 1, 
    pageSize = 10, 
    totalItems = 0, 
    totalPages = 0,
    startIndex = 1,
    endIndex = 0,
    hasNextPage = false,
    hasPreviousPage = false
  } = pagination || {}

  // Page size options
  const pageSizeOptions = [
    { value: 5, label: '5 per page' },
    { value: 10, label: '10 per page' },
    { value: 25, label: '25 per page' },
    { value: 50, label: '50 per page' },
    { value: 100, label: '100 per page' }
  ]

  // Generate page numbers for display with smart ellipsis
  const getPageNumbers = useCallback(() => {
    if (totalPages <= 7) {
      // Show all pages if total is small
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages = []
    
    if (currentPage <= 4) {
      // Show first pages + ellipsis + last
      pages.push(1, 2, 3, 4, 5, '...', totalPages)
    } else if (currentPage >= totalPages - 3) {
      // Show first + ellipsis + last pages
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      // Show first + ellipsis + current area + ellipsis + last
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
    }
    
    return pages
  }, [currentPage, totalPages])

  const pageNumbers = getPageNumbers()

  // ===== HANDLERS =====
  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page)
    }
  }, [currentPage, totalPages, onPageChange])

  const handlePageSizeChange = useCallback((newPageSize) => {
    const newSize = parseInt(newPageSize)
    if (newSize !== pageSize) {
      onPageSizeChange?.(newSize)
      // Reset to first page when changing page size
      onPageChange?.(1)
    }
  }, [pageSize, onPageSizeChange, onPageChange])

  const handleQuickJump = useCallback((direction) => {
    switch (direction) {
      case 'first':
        handlePageChange(1)
        break
      case 'last':
        handlePageChange(totalPages)
        break
      case 'prev-block':
        handlePageChange(Math.max(1, currentPage - 5))
        break
      case 'next-block':
        handlePageChange(Math.min(totalPages, currentPage + 5))
        break
    }
  }, [currentPage, totalPages, handlePageChange])

  // ===== BULK ACTIONS =====
  const bulkActions = useMemo(() => {
    const actions = []
    
    if (mode === 'available') {
      actions.push(
        { key: 'express_interest', label: 'Express Interest in Selected', icon: Eye },
        { key: 'save_for_later', label: 'Save for Later', icon: Download }
      )
    } else if (mode === 'interests') {
      actions.push(
        { key: 'update_quotes', label: 'Update Selected Quotes', icon: Settings },
        { key: 'withdraw_interest', label: 'Withdraw Interest', icon: ChevronLeft }
      )
    } else if (mode === 'assigned') {
      actions.push(
        { key: 'accept_all', label: 'Accept Selected', icon: ChevronRight },
        { key: 'send_message', label: 'Message Customers', icon: Settings }
      )
    }
    
    actions.push(
      { key: 'export', label: 'Export Selected', icon: Download }
    )
    
    return actions
  }, [mode])

  // ===== RENDER COMPONENTS =====
  const renderPageSizeSelector = () => (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Show:</span>
      <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
        <SelectTrigger className="w-[120px] h-8 bg-background border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {pageSizeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const renderQuickJump = () => (
    <div className="flex items-center space-x-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickJump('first')}
            disabled={currentPage === 1}
            className={cn(
              "h-8 w-8 p-0 bg-background hover:bg-muted border-border",
              currentPage === 1 && "opacity-50 cursor-not-allowed"
            )}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>First page</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickJump('last')}
            disabled={currentPage === totalPages}
            className={cn(
              "h-8 w-8 p-0 bg-background hover:bg-muted border-border",
              currentPage === totalPages && "opacity-50 cursor-not-allowed"
            )}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Last page</TooltipContent>
      </Tooltip>
    </div>
  )

  const renderPageNumbers = () => (
    <div className="flex items-center space-x-1">
      {pageNumbers.map((pageNum, index) => (
        <div key={index}>
          {pageNum === '...' ? (
            <div className="flex items-center justify-center w-8 h-8">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>
          ) : (
            <Button
              variant={pageNum === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              className={cn(
                "h-8 w-8 p-0",
                pageNum === currentPage 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-background hover:bg-muted border-border text-foreground"
              )}
            >
              {pageNum}
            </Button>
          )}
        </div>
      ))}
    </div>
  )

  const renderBulkActions = () => {
    if (!selectionState?.hasSelection || !showBulkActions) return null

    return (
      <div className="flex items-center space-x-2">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
          {selectionState.selectedCount} selected
        </Badge>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-background hover:bg-muted border-border">
              Bulk Actions
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            {bulkActions.map((action, index) => (
              <div key={action.key}>
                {index > 0 && index % 2 === 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem 
                  onClick={() => onBulkAction?.(action.key, selectionState.selectedCount)}
                  className="flex items-center text-foreground hover:bg-muted"
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label} ({selectionState.selectedCount})
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  const renderDataStats = () => {
    if (!showDataStats) return null

    const stats = []
    
    // Basic pagination info
    if (totalItems > 0) {
      stats.push(`${startIndex}-${endIndex} of ${totalItems}`)
    }
    
    // Filter efficiency
    if (dataStats?.hasActiveFilters && dataStats.filterEfficiency < 100) {
      stats.push(`${dataStats.filterEfficiency}% filtered`)
    }
    
    // Selection info
    if (selectionState?.hasSelection) {
      const percentage = Math.round((selectionState.selectedCount / totalItems) * 100)
      stats.push(`${percentage}% selected`)
    }

    return (
      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
        {stats.map((stat, index) => (
          <span key={index}>{stat}</span>
        ))}
        
        {dataStats?.hasActiveFilters && (
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center space-x-1 text-xs">
                <Info className="h-3 w-3" />
                <span>Filtered view</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Showing filtered results. {dataStats.total - dataStats.filtered} items hidden.</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    )
  }

  // ===== MAIN RENDER =====
  return (
    <TooltipProvider>
      <Card className={cn("bg-card border-border", className)} {...props}>
        <CardContent className="p-4">
          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between">
            {/* Left Side - Data Stats and Page Size */}
            <div className="flex items-center space-x-6">
              {renderDataStats()}
              {showPageSizeSelector && totalPages > 1 && renderPageSizeSelector()}
            </div>
            
            {/* Center - Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                {showQuickJump && renderQuickJump()}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPreviousPage}
                  className={cn(
                    "h-8 px-3 bg-background hover:bg-muted border-border",
                    !hasPreviousPage && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                {renderPageNumbers()}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  className={cn(
                    "h-8 px-3 bg-background hover:bg-muted border-border",
                    !hasNextPage && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
                
                {showQuickJump && renderQuickJump()}
              </div>
            )}
            
            {/* Right Side - Bulk Actions */}
            <div className="flex items-center space-x-2">
              {renderBulkActions()}
              
              {onExport && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onExport?.(selectionState?.hasSelection ? 'selected' : 'all')}
                      className="bg-background hover:bg-muted border-border"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Export {selectionState?.hasSelection ? 'selected items' : 'all data'}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          
          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            {/* Top Row - Stats and Selection */}
            <div className="flex items-center justify-between">
              {renderDataStats()}
              {renderBulkActions()}
            </div>
            
            {/* Middle Row - Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPreviousPage}
                  className="h-8 px-3 bg-background hover:bg-muted border-border"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center space-x-1">
                  {/* Show simplified pagination on mobile */}
                  {currentPage > 2 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        className="h-8 w-8 p-0 bg-background hover:bg-muted border-border"
                      >
                        1
                      </Button>
                      {currentPage > 3 && <span className="text-muted-foreground">...</span>}
                    </>
                  )}
                  
                  {currentPage > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="h-8 w-8 p-0 bg-background hover:bg-muted border-border"
                    >
                      {currentPage - 1}
                    </Button>
                  )}
                  
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 w-8 p-0 bg-primary text-primary-foreground"
                  >
                    {currentPage}
                  </Button>
                  
                  {currentPage < totalPages && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="h-8 w-8 p-0 bg-background hover:bg-muted border-border"
                    >
                      {currentPage + 1}
                    </Button>
                  )}
                  
                  {currentPage < totalPages - 1 && (
                    <>
                      {currentPage < totalPages - 2 && <span className="text-muted-foreground">...</span>}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        className="h-8 w-8 p-0 bg-background hover:bg-muted border-border"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  className="h-8 px-3 bg-background hover:bg-muted border-border"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Bottom Row - Page Size */}
            {showPageSizeSelector && totalPages > 1 && (
              <div className="flex justify-center">
                {renderPageSizeSelector()}
              </div>
            )}
          </div>
          
          {/* Additional Mobile Info */}
          <div className="sm:hidden mt-3 pt-3 border-t border-border text-center">
            <div className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
              {selectionState?.hasSelection && (
                <span className="ml-2 text-primary">• {selectionState.selectedCount} selected</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
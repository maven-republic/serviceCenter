// src/components/professional-workspace/appointments/AppointmentPagination.jsx
'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'

export function AppointmentPagination({ pagination, onPageChange }) {
  // 🚨 ADD THIS CRITICAL SAFETY CHECK 🚨
  if (!pagination || !pagination.totalPages || pagination.totalPages <= 1) {
    return null
  }

  // Destructure with defaults to prevent undefined errors
  const { 
    page = 1, 
    limit = 10, 
    total = 0, 
    totalPages = 0 
  } = pagination
  
  // Calculate display range
  const startItem = ((page - 1) * limit) + 1
  const endItem = Math.min(page * limit, total)
  
  // Generate page numbers for display
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Smart pagination logic
      if (page <= 3) {
        // Show first pages + ellipsis + last
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (page >= totalPages - 2) {
        // Show first + ellipsis + last pages
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        // Show first + ellipsis + current area + ellipsis + last
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages)
      }
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          
          {/* Results Summary */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>
              Showing <strong className="text-foreground">{startItem}</strong> to{' '}
              <strong className="text-foreground">{endItem}</strong> of{' '}
              <strong className="text-foreground">{total}</strong> appointments
            </span>
            
            {total > 0 && (
              <Badge variant="outline" className="bg-background text-muted-foreground border-border">
                Page {page} of {totalPages}
              </Badge>
            )}
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center space-x-1">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              className={cn(
                "h-9 w-9 p-0 bg-background hover:bg-muted border-border",
                page === 1 && "opacity-50 cursor-not-allowed"
              )}
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
            
            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className={cn(
                "h-9 px-3 bg-background hover:bg-muted border-border",
                page === 1 && "opacity-50 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {pageNumbers.map((pageNum, index) => (
                <div key={index}>
                  {pageNum === '...' ? (
                    <span className="px-2 py-1 text-muted-foreground">...</span>
                  ) : (
                    <Button
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      className={cn(
                        "h-9 w-9 p-0",
                        page === pageNum 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                          : "bg-background hover:bg-muted border-border text-foreground"
                      )}
                    >
                      {pageNum}
                      <span className="sr-only">Page {pageNum}</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className={cn(
                "h-9 px-3 bg-background hover:bg-muted border-border",
                page === totalPages && "opacity-50 cursor-not-allowed"
              )}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            
            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
              className={cn(
                "h-9 w-9 p-0 bg-background hover:bg-muted border-border",
                page === totalPages && "opacity-50 cursor-not-allowed"
              )}
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          </div>
        </div>
        
        {/* Mobile-friendly summary */}
        <div className="sm:hidden mt-3 pt-3 border-t border-border text-center">
          <div className="text-xs text-muted-foreground">
            Use the arrows above to navigate between pages
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AppointmentPagination
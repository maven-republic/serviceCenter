"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Pagination1({ 
  totalItems, 
  itemsPerPage = 20, 
  onPageChange,
  currentPage: externalCurrentPage 
}) {
  const [currentPage, setCurrentPage] = useState(externalCurrentPage || 1);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Sync with external current page if provided
  useEffect(() => {
    if (externalCurrentPage && externalCurrentPage !== currentPage) {
      setCurrentPage(externalCurrentPage);
    }
  }, [externalCurrentPage]);

  // Generate page numbers array with ellipsis logic
  const getPageNumbers = () => {
    const delta = 1; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Always show first page
    if (totalPages <= 1) return [1];

    // Calculate range around current page
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    // Add pages to range
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Add first page
    rangeWithDots.push(1);

    // Add ellipsis before range if needed
    if (start > 2) {
      rangeWithDots.push('ellipsis-start');
    }

    // Add the range (excluding first and last which are handled separately)
    range.forEach(page => {
      if (page !== 1 && page !== totalPages) {
        rangeWithDots.push(page);
      }
    });

    // Add ellipsis after range if needed
    if (end < totalPages - 1) {
      rangeWithDots.push('ellipsis-end');
    }

    // Add last page if it's not already included
    if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      if (onPageChange) {
        onPageChange(page);
      }
    }
  };

  // If no items or only one page, don't show pagination
  if (totalItems <= 0 || totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();
  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-2">
        {/* First Page Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="h-8 w-8"
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First page</span>
        </Button>

        {/* Previous Page Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <div key={`ellipsis-${index}`} className="flex h-8 w-8 items-center justify-center">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            }

            const isCurrentPage = page === currentPage;

            return (
              <Button
                key={page}
                variant={isCurrentPage ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageChange(page)}
                className={cn(
                  "h-8 w-8",
                  isCurrentPage && "pointer-events-none"
                )}
                aria-current={isCurrentPage ? "page" : undefined}
              >
                {page}
                {isCurrentPage && <span className="sr-only">(current)</span>}
              </Button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>

        {/* Last Page Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-8 w-8"
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last page</span>
        </Button>
      </div>

      {/* Page Info (Mobile) */}
      <div className="sm:hidden text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}
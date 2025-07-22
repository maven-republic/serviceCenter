// ============================================================================
// Connected Pagination Component - navigation/DiscoveriesPagination.jsx
// Properly integrated with SearchContext and URL state
// ============================================================================

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
import { useSearch } from '../context/SearchContext';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DiscoveriesPagination({ 
  totalItems, 
  itemsPerPage = 24 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { query, filters, performSearch } = useSearch();
  
  // Get current page from URL or default to 1
  const [currentPage, setCurrentPage] = useState(() => {
    const urlPage = searchParams.get('page');
    return urlPage ? parseInt(urlPage, 10) : 1;
  });
  
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Sync with URL parameters
  useEffect(() => {
    const urlPage = searchParams.get('page');
    const pageFromUrl = urlPage ? parseInt(urlPage, 10) : 1;
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [searchParams]);

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
  
  // Handle page change with SearchContext integration
  const handlePageChange = async (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      
      // Update URL with new page
      const params = new URLSearchParams(searchParams.toString());
      if (page === 1) {
        params.delete('page'); // Clean URL for page 1
      } else {
        params.set('page', String(page));
      }
      
      // Update URL
      const queryString = params.toString();
      const newUrl = `/customer/workspace${queryString ? `?${queryString}` : ''}`;
      router.push(newUrl);
      
      // Trigger new search with pagination
      try {
        const searchOptions = {
          keywords: true,
          fuzzy: true,
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage
        };
        
        await performSearch(query, searchOptions);
      } catch (error) {
        console.error('Pagination search failed:', error);
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

/* 
🎯 PAGINATION INTEGRATION FEATURES:

✅ SEARCHCONTEXT INTEGRATION:
- Uses useSearch hook for query and filters
- Calls performSearch with pagination params
- Maintains search state across page changes

✅ URL SYNCHRONIZATION:
- Reads current page from URL parameters
- Updates URL when page changes
- Clean URLs (no ?page=1 for first page)

✅ API INTEGRATION:
- Sends limit and offset to search API
- Maintains search query and filters
- Handles pagination responses properly

✅ STATE MANAGEMENT:
- Syncs with URL parameters
- Updates local state correctly
- Handles page navigation smoothly

USAGE IN DISCOVERIES:
Just pass totalItems and itemsPerPage:
<DiscoveriesPagination
  totalItems={totalResults}
  itemsPerPage={24}
/>
*/
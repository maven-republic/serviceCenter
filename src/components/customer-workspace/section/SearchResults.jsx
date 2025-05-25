'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// In SearchResults.jsx
import ServiceCard from '@/components/customer-workspace/card/category';
import ProviderCard from '@/components/customer-workspace/card/professional';
import { ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';

export default function SearchResults({ 
  results, 
  pagination, 
  currentQuery, 
  currentType,
  currentFilters,
  isAuthenticated
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const router = useRouter();
  
  // No results state
  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-2">No results found</h3>
        <p className="text-gray-600 mb-6">
          We couldn't find any matches for your search.
        </p>
        <div className="flex flex-col gap-3 max-w-md mx-auto">
          <p className="text-gray-700 text-sm">Try:</p>
          <ul className="text-sm text-left list-disc pl-5 space-y-1">
            <li>Checking your spelling</li>
            <li>Using more general keywords</li>
            <li>Removing filters</li>
            <li>Searching by category instead</li>
          </ul>
        </div>
      </div>
    );
  }
  
  // Handle pagination
  const changePage = (newPage) => {
    const params = new URLSearchParams(currentFilters);
    params.set('page', newPage.toString());
    router.push(`/customer/search?${params.toString()}`);
  };
  
  // Toggle between grid and list views
  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };
  
  // Sort change handler
  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    
    const params = new URLSearchParams(currentFilters);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    params.delete('page'); // Reset to page 1
    
    router.push(`/customer/search?${params.toString()}`);
  };
  
  return (
    <div>
      {/* Results controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Showing {((pagination.page - 1) * pagination.pageSize) + 1}-
          {Math.min(pagination.page * pagination.pageSize, pagination.total || 0)} 
          of {pagination.total || 0}
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
            onChange={handleSortChange}
            value={`${currentFilters.sortBy || 'relevance'}-${currentFilters.sortOrder || 'desc'}`}
          >
            <option value="relevance-desc">Most Relevant</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="featured-desc">Featured</option>
            {currentType === 'provider' && (
              <option value="experience-desc">Most Experienced</option>
            )}
          </select>
          
          <button 
            onClick={toggleViewMode}
            className="p-1.5 border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50"
            aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
          </button>
        </div>
      </div>
      
      {/* Results grid/list */}
      <div className={`
        ${viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'flex flex-col gap-4'
        }
      `}>
        {results.map((result) => (
          <div key={`${result.type}-${result.type === 'service' ? result.service_id : result.professional_id}`}>
            {result.type === 'service' ? (
              <ServiceCard 
                service={result} 
                view={viewMode} 
                isAuthenticated={isAuthenticated} 
              />
            ) : (
              <ProviderCard 
                provider={result} 
                view={viewMode} 
                isAuthenticated={isAuthenticated} 
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <button
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className={`p-2 rounded-md ${
                pagination.page <= 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            
            {[...Array(pagination.totalPages)].map((_, i) => {
              const pageNum = i + 1;
              // Show first page, last page, current page, and pages around current
              if (
                pageNum === 1 ||
                pageNum === pagination.totalPages ||
                (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => changePage(pageNum)}
                    className={`w-8 h-8 rounded-md ${
                      pageNum === pagination.page
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-current={pageNum === pagination.page ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                (pageNum === 2 && pagination.page > 3) ||
                (pageNum === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 2)
              ) {
                // Show ellipsis
                return <span key={`ellipsis-${pageNum}`} className="px-1">...</span>;
              }
              return null;
            })}
            
            <button
              onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className={`p-2 rounded-md ${
                pagination.page >= pagination.totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}


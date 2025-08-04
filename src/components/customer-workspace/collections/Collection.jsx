// ============================================================================
// REWRITTEN: src/components/customer-workspace/collections/Collection.jsx
// Clean implementation with proper debug logging
// ============================================================================

"use client";

import { useState, Suspense, useEffect } from 'react';
import { useCollectionData } from '@/primitives/customer/useCollectionData';
import { createFilters, applySorting } from '@/utils/customer/collectionFilters';

// Keep your existing component imports
import Sift from "@/components/element/Sift";
import Pagination1 from "@/components/section/Pagination1";
import Manifest from "@/components/card/Manifest";

// Import modular components
import { CollectionHeader } from './CollectionHeader';
import { ViewControls } from './ViewControls';
import { ResultsSummaryBar } from './ResultsSummaryBar';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { ServicesList } from './ServicesList';

function CollectionContent() {
  // Local state
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recommended');
  
  // Get collection data
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    loading,
    services,
    error,
    totalResults,
    urlQuery,
    urlCategory,
    searchQuery,
    resetAllFilters,
    retryFetch,
    ...stores
  } = useCollectionData();

  // 🔍 COMPREHENSIVE DEBUG LOGGING
  useEffect(() => {
    console.log('🎯 Collection State Change:', {
      timestamp: new Date().toISOString(),
      services: {
        count: services.length,
        preview: services.slice(0, 3).map(s => ({
          id: s.id || s.service_id,
          name: s.name || s.title || s.service_name || 'Unknown',
          type: s.type || 'unknown'
        }))
      },
      search: {
        urlQuery,
        searchQuery,
        hasAnyQuery: !!(urlQuery || searchQuery)
      },
      state: {
        loading,
        totalResults,
        error: !!error
      }
    });
  }, [services, searchQuery, urlQuery, loading, totalResults, error]);

  // Create filters
  const filters = createFilters(stores);

  // Apply all filters
  let filteredServices = [];
  
  if (services && Array.isArray(services)) {
    filteredServices = services
      .filter(filters.deliveryFilter)
      .filter(filters.priceFilter)
      .filter(filters.levelFilter)
      .filter(filters.locationFilter)
      .filter(filters.searchFilter)
      .filter(filters.sortByFilter)
      .filter(filters.designToolFilter)
      .filter(filters.speakFilter)
      .filter(filters.categoryFilter);

    // Apply sorting
    filteredServices = applySorting(filteredServices, sortBy);
  }

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  
  // 🔍 DEBUG PAGINATION
  useEffect(() => {
    console.log('🎯 Pagination Debug:', {
      filteredServices: filteredServices.length,
      currentItems: currentItems.length,
      pagination: {
        currentPage,
        itemsPerPage,
        indexOfFirstItem,
        indexOfLastItem
      }
    });
  }, [filteredServices.length, currentItems.length, currentPage, itemsPerPage]);

  // Event handlers
  const handlePageChange = (pageNumber) => {
    console.log('📄 Page change to:', pageNumber);
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value) => {
    console.log('📄 Items per page change to:', value);
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // 🔍 DEBUG RENDER CONDITIONS
  console.log('🎯 Render Conditions:', {
    showError: error && services.length === 0 && !loading,
    showLoading: loading,
    showResults: !loading && currentItems.length > 0,
    showEmpty: !loading && currentItems.length === 0,
    showPagination: !loading && filteredServices.length > itemsPerPage
  });

  // Error state
  if (error && services.length === 0 && !loading) {
    console.log('🎯 Rendering: Error State');
    return <ErrorState error={error} onRetry={retryFetch} />;
  }

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <CollectionHeader
          urlQuery={urlQuery}
          urlCategory={urlCategory}
          searchQuery={searchQuery}
          totalResults={totalResults}
          filteredCount={filteredServices.length}
          loading={loading}
          error={error}
          servicesCount={services.length}
        />
        
        <ViewControls
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {/* Filters Section */}
      <div className="mb-6">
        <Sift />
      </div>

      {/* Results Summary Bar */}
      <ResultsSummaryBar
        loading={loading}
        currentItems={currentItems}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        filteredCount={filteredServices.length}
        servicesCount={services.length}
        sortBy={sortBy}
        onClearFilters={resetAllFilters}
      />

      {/* Loading State */}
      {loading && (
        <>
          {console.log('🎯 Rendering: Loading State')}
          <LoadingSkeleton itemsPerPage={itemsPerPage} />
        </>
      )}

      {/* Main Content Area */}
      {!loading && (
        <>
          {currentItems.length > 0 ? (
            <>
              {console.log('🎯 Rendering: Services List with', currentItems.length, 'items')}
              <ServicesList 
                items={currentItems} 
                viewMode={viewMode} 
                ManifestComponent={Manifest}
              />
            </>
          ) : (
            <>
              {console.log('🎯 Rendering: Empty State')}
              <EmptyState
                servicesCount={services.length}
                onClearFilters={resetAllFilters}
                onRetry={retryFetch}
              />
            </>
          )}
        </>
      )}

      {/* Pagination */}
      {!loading && filteredServices.length > itemsPerPage && (
        <>
          {console.log('🎯 Rendering: Pagination')}
          <div className="mt-8">
            <Pagination1 
              totalItems={filteredServices.length} 
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              currentPage={currentPage}
            />
          </div>
        </>
      )}

      {/* Final Debug Summary */}
      {console.log('🎯 Final Render Summary:', {
        component: 'Collection',
        renderTime: new Date().toISOString(),
        finalState: {
          loading,
          servicesCount: services.length,
          filteredCount: filteredServices.length,
          currentItemsCount: currentItems.length,
          hasQuery: !!(urlQuery || searchQuery),
          showingResults: !loading && currentItems.length > 0
        }
      })}
    </>
  );
}

function CollectionFallback() {
  console.log('🎯 Rendering: Collection Fallback');
  return <LoadingSkeleton />;
}

export default function Collection() {
  console.log('🎯 Collection Component Mount/Update');
  
  return (
    <Suspense fallback={<CollectionFallback />}>
      <CollectionContent />
    </Suspense>
  );
}
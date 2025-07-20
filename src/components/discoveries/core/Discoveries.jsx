// ============================================================================
// Full-Width Discoveries Component - src/components/discoveries/core/Discoveries.jsx
// Maximum space for services with right-side filter drawer
// ============================================================================

'use client';

import { useState } from 'react';
import { useSearch } from '../context/SearchContext';
import DiscoveriesHeader from './DiscoveriesHeader';
import DiscoveriesList from './DiscoveriesList';
import DiscoveriesLoading from './DiscoveriesLoading';
import DiscoveriesEmpty from './DiscoveriesEmpty';
import DiscoveriesError from './DiscoveriesError';
import DiscoveriesFilters from './DiscoveriesFilters';
import DiscoveriesPagination from '../navigation/DiscoveriesPagination';

// Import Sheet components
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Grid, List, X } from "lucide-react";

export default function Discoveries() {
  const {
    query,
    results,
    isLoading,
    error,
    totalResults,
    searchTimeMs,
    usedFuzzy,
    filters,
    clearFilters
  } = useSearch();

  // Local state for UI controls
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(value => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.length > 0;
    if (typeof value === 'number') return value > 0;
    return false;
  }).length;

  // Filter badges for display
  const getFilterBadges = () => {
    const badges = [];
    
    if (filters.minPrice && filters.maxPrice) {
      badges.push({
        label: `J$${filters.minPrice.toLocaleString()} - J$${filters.maxPrice.toLocaleString()}`,
        key: 'price',
        onRemove: () => clearFilters()
      });
    }
    
    if (filters.featured) {
      badges.push({
        label: 'Featured',
        key: 'featured',
        onRemove: () => clearFilters()
      });
    }
    
    if (filters.industry) {
      badges.push({
        label: filters.industry,
        key: 'industry',
        onRemove: () => clearFilters()
      });
    }
    
    if (filters.vertical) {
      badges.push({
        label: filters.vertical,
        key: 'vertical',
        onRemove: () => clearFilters()
      });
    }
    
    if (filters.parish) {
      badges.push({
        label: filters.parish,
        key: 'parish',
        onRemove: () => clearFilters()
      });
    }
    
    return badges;
  };

  const filterBadges = getFilterBadges();

  return (
    <div className="space-y-6">
      {/* Header with Filter Button and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">
            {query ? `Discoveries for "${query}"` : 'All Services'}
          </h2>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{totalResults} results</span>
            {searchTimeMs && (
              <>
                <span>•</span>
                <span>{searchTimeMs}ms</span>
              </>
            )}
            {usedFuzzy && (
              <>
                <span>•</span>
                <Badge variant="secondary" className="text-xs">
                  Smart Search
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          {/* Filter Drawer Trigger */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96">
              <SheetHeader>
                <SheetTitle>Filter Services</SheetTitle>
                <SheetDescription>
                  Refine your search to find the perfect service
                </SheetDescription>
              </SheetHeader>
              
              {/* Filter Content */}
              <div className="mt-6">
                <DiscoveriesFilters />
              </div>
            </SheetContent>
          </Sheet>

          {/* View Mode Toggle */}
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {filterBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filterBadges.map((badge) => (
            <Badge 
              key={badge.key} 
              variant="secondary" 
              className="flex items-center gap-1"
            >
              {badge.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={badge.onRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {filterBadges.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Main Content - Full Width! */}
      <div className="w-full">
        {/* Loading State */}
        {isLoading && <DiscoveriesLoading />}

        {/* Error State */}
        {error && !isLoading && (
          <DiscoveriesError error={error} />
        )}

        {/* Results - Full Width Grid */}
        {!isLoading && !error && results.length > 0 && (
          <>
            <DiscoveriesList results={results} viewMode={viewMode} />
            
            {/* Pagination */}
            {results.length > 24 && (
              <div className="mt-8">
                <DiscoveriesPagination
                  totalItems={totalResults}
                  itemsPerPage={24}
                  currentPage={1}
                  onPageChange={(page) => console.log('Page change:', page)}
                />
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && query && results.length === 0 && (
          <DiscoveriesEmpty query={query} />
        )}

        {/* No services at all */}
        {!isLoading && !error && !query && results.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No services available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
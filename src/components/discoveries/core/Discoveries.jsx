// ============================================================================
// Phase 3: Discoveries Component Optimization - core/Discoveries.jsx
// Eliminates spacing issues, perfect service grid integration
// ============================================================================

'use client';

import { useState } from 'react';
import { useSearch } from '../context/SearchContext';
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
import { Filter, X } from "lucide-react";

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
    // ✅ CLEAN CONTAINER: No excessive spacing, minimal bottom padding
    <div className="w-full">
      
      {/* ✅ CONTROLS BAR: Compact, responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        
        

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          
          {/* Filter Drawer */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
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
              <div className="mt-6">
                <DiscoveriesFilters />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* ✅ ACTIVE FILTER BADGES: Only show when needed */}
      {filterBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
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

      {/* ✅ CONTENT STATES: Direct, no wrapper containers */}
      
      {/* Loading State */}
      {isLoading && (
        <DiscoveriesLoading />
      )}

      {/* Error State */}
      {error && !isLoading && (
        <DiscoveriesError error={error} />
      )}

      {/* ✅ RESULTS: Clean integration with service grid */}
      {!isLoading && !error && results.length > 0 && (
  <div className="space-y-8">
    {/* Service Grid - Removed viewMode */}
    <DiscoveriesList results={results} />
    
    {/* ✅ CONNECTED: Pagination with SearchContext integration */}
    {totalResults > 24 && (
      <DiscoveriesPagination
        totalItems={totalResults}
        itemsPerPage={24}
      />
    )}
  </div>
)}

      {/* Empty State */}
      {!isLoading && !error && query && results.length === 0 && (
        <DiscoveriesEmpty query={query} />
      )}

      {/* No services state */}
      {!isLoading && !error && !query && results.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No services available at the moment.</p>
        </div>
      )}
      
    </div>
  );
}

/* 
🎯 PHASE 3 ARCHITECTURE DECISIONS:

✅ SPACING OPTIMIZATION:
- mb-6 for consistent section spacing
- space-y-8 between grid and pagination
- pt-2 for minimal pagination spacing
- No excessive pb-8 or margin accumulation

✅ CONTENT FLOW:
- Direct content states, no wrapper containers
- Clean conditional rendering
- No nested spacing conflicts

✅ RESPONSIVE CONTROLS:
- Compact controls bar with proper flex layout
- Filter drawer for mobile/desktop
- Smart search indicators

✅ PERFORMANCE:
- Minimal re-renders
- Conditional badge rendering
- Clean state management

NEXT: Phase 4 will optimize the service grid layout
*/
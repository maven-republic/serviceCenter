// ============================================================================
// Discoveries.jsx - Complete Rewrite with Refactored Loading System
// ============================================================================

'use client';

import { useState } from 'react';
import { useSearch } from '../context/SearchContext';
import DiscoveriesList from './DiscoveriesList';
import DiscoveriesLoading from './DiscoveriesLoading';
import DiscoveriesEmpty from './DiscoveriesEmpty';
import DiscoveriesError from './DiscoveriesError';
import DiscoveriesFilters from './DiscoveriesFilters';

// Import Sheet components for filter drawer
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
import { Filter, Grid, List, X, Clock, Zap } from "lucide-react";

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

  // 🚀 INFINITE SCROLL CONFIGURATION
  const itemsPerPage = 12;
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const hasMore = totalResults > results.length && results.length >= itemsPerPage;

  console.log('📊 Discoveries state:', {
    totalResults,
    currentResults: results.length,
    hasMore,
    totalPages,
    query: query || 'no query'
  });

  // Function to handle loading more results for infinite scroll
  const handleLoadMore = async (page, limit) => {
    console.log(`🔄 Discoveries.handleLoadMore: page=${page}, limit=${limit}`);
    
    try {
      // Build search parameters for pagination
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      // Add current query if it exists
      if (query && query.trim()) {
        params.set('q', query.trim());
        params.set('keywords', 'true');
        params.set('fuzzy', 'true');
      }

      // Add current filters to maintain search context
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== false) {
          const paramKey = key === 'minPrice' ? 'min_price' : 
                          key === 'maxPrice' ? 'max_price' : key;
          params.set(paramKey, String(value));
        }
      });

      const apiUrl = `/api/search?${params.toString()}`;
      console.log(`📡 Fetching more results: ${apiUrl}`);

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to load more results: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      console.log(`✅ LoadMore success: ${data.results?.length || 0} new results`);
      
      return data.results || [];
      
    } catch (error) {
      console.error('❌ LoadMore error:', error);
      throw error;
    }
  };

  // Count active filters for badge display
  const activeFiltersCount = Object.values(filters).filter(value => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.length > 0;
    if (typeof value === 'number') return value > 0;
    return false;
  }).length;

  // Generate filter badges for display
  const getFilterBadges = () => {
    const badges = [];
    
    if (filters.minPrice && filters.maxPrice) {
      badges.push({
        label: `J$${filters.minPrice.toLocaleString()} - J$${filters.maxPrice.toLocaleString()}`,
        key: 'price-range',
        onRemove: () => clearFilters()
      });
    } else if (filters.minPrice) {
      badges.push({
        label: `Min J$${filters.minPrice.toLocaleString()}`,
        key: 'min-price',
        onRemove: () => clearFilters()
      });
    } else if (filters.maxPrice) {
      badges.push({
        label: `Max J$${filters.maxPrice.toLocaleString()}`,
        key: 'max-price',
        onRemove: () => clearFilters()
      });
    }
    
    if (filters.featured) {
      badges.push({
        label: 'Featured Only',
        key: 'featured',
        onRemove: () => clearFilters()
      });
    }
    
    if (filters.industry) {
      badges.push({
        label: `Industry: ${filters.industry}`,
        key: 'industry',
        onRemove: () => clearFilters()
      });
    }
    
    if (filters.vertical) {
      badges.push({
        label: `Category: ${filters.vertical}`,
        key: 'vertical',
        onRemove: () => clearFilters()
      });
    }
    
    if (filters.parish) {
      badges.push({
        label: `Parish: ${filters.parish}`,
        key: 'parish',
        onRemove: () => clearFilters()
      });
    }
    
    return badges;
  };

  const filterBadges = getFilterBadges();

  return (
    <div className="space-y-6">
      
      {/* 📋 HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Left side - Search info & stats */}
        {(query || results.length > 0) && (
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground mb-1">
              {query ? (
                <>Discoveries for "<span className="text-primary">{query}</span>"</>
              ) : (
                'All Services'
              )}
            </h2>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <span className="font-medium">{totalResults.toLocaleString()}</span>
                <span>{totalResults === 1 ? 'result' : 'results'}</span>
              </div>
              
              {searchTimeMs && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{searchTimeMs}ms</span>
                  </div>
                </>
              )}
              
              {usedFuzzy && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-blue-500" />
                    <span className="text-blue-600">Smart Search</span>
                  </div>
                </>
              )}
              
              {hasMore && results.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <span className="text-green-600">Infinite scroll enabled</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Right Side Controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          
          {/* 🎛️ Filter Drawer */}
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
              
              <div className="mt-6">
                <DiscoveriesFilters />
              </div>
            </SheetContent>
          </Sheet>

          {/* 📱 View Mode Toggle */}
          <div className="flex rounded-md border bg-background">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 🏷️ ACTIVE FILTER BADGES */}
      {filterBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg border">
          <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
          
          <div className="flex flex-wrap items-center gap-2">
            {filterBadges.map((badge) => (
              <Badge 
                key={badge.key} 
                variant="secondary" 
                className="flex items-center gap-1 text-xs"
              >
                {badge.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-transparent"
                  onClick={badge.onRemove}
                  aria-label={`Remove ${badge.label} filter`}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
            
            {filterBadges.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground text-xs h-6"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 🎨 MAIN CONTENT AREA */}
      <div className="w-full">
        
        {/* 🔄 LOADING STATE */}
        {isLoading && (
          <DiscoveriesLoading 
            viewMode={viewMode} 
            count={viewMode === 'grid' ? 12 : 8} 
          />
        )}

        {/* ❌ ERROR STATE */}
        {error && !isLoading && (
          <DiscoveriesError error={error} />
        )}

        {/* ✅ RESULTS WITH INFINITE SCROLL */}
        {!isLoading && !error && results.length > 0 && (
          <DiscoveriesList 
            results={results} 
            viewMode={viewMode}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            loading={isLoading}
            error={error}
            loadingThreshold={300}
            itemsPerPage={itemsPerPage}
          />
        )}

        {/* 🔍 EMPTY STATE - No results for search query */}
        {!isLoading && !error && query && results.length === 0 && (
          <DiscoveriesEmpty query={query} />
        )}

        {/* 🏠 WELCOME STATE - No query, no results */}
        {!isLoading && !error && !query && results.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Welcome to Service Discovery
              </h3>
              <p className="text-muted-foreground mb-6">
                Start by searching for services or browse through our categories to find what you need.
              </p>
              <div className="flex items-center justify-center gap-2">
                <Button onClick={() => window.location.reload()} variant="outline">
                  Browse All Services
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
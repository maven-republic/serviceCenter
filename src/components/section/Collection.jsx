"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Search,
  Filter,
  Grid3X3,
  List,
  Zap,
  TrendingUp
} from "lucide-react";

import listingStore from "@/store/listingStore";
import priceStore from "@/store/priceStore";
import useSearchStore from "@/store/searchStore";
import Sift from "../element/Sift";
import Pagination1 from "./Pagination1";
import Manifest from "../card/Manifest";
import { cn } from "@/lib/utils";

export default function Collection() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recommended');
  const [totalResults, setTotalResults] = useState(0);
  
  // URL search params
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q');
  const urlType = searchParams.get('type');
  const urlCategory = searchParams.get('category');
  
  // Store state
  const getDeliveryTime = listingStore((state) => state.getDeliveryTime);
  const getPriceRange = priceStore((state) => state.priceRange);
  const getLevel = listingStore((state) => state.getLevel);
  const getLocation = listingStore((state) => state.getLocation);
  const getBestSeller = listingStore((state) => state.getBestSeller);
  const getDesginTool = listingStore((state) => state.getDesginTool);
  const getSpeak = listingStore((state) => state.getSpeak);
  const getSearch = listingStore((state) => state.getSearch);
  const resetAllFilters = listingStore((state) => state.resetAllFilters);
  const getCategory = listingStore((state) => state.getCategory);
  
  // Search store
  const { searchQuery, setSearchQuery } = useSearchStore();

  // 🔧 FIXED: Async data fetching with proper error handling
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const isSearchQuery = urlQuery || searchQuery || getSearch;
      let apiUrl;
      let requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      };

      if (isSearchQuery) {
        // Search API
        apiUrl = new URL('/api/search', window.location.origin);
        apiUrl.searchParams.set('q', isSearchQuery);
        apiUrl.searchParams.set('type', urlType || 'all');
        apiUrl.searchParams.set('limit', itemsPerPage.toString());
        apiUrl.searchParams.set('offset', ((currentPage - 1) * itemsPerPage).toString());
        
        // Add filters
        if (urlCategory) apiUrl.searchParams.set('category', urlCategory);
        if (getPriceRange.min > 0) apiUrl.searchParams.set('min_price', getPriceRange.min.toString());
        if (getPriceRange.max < 100000) apiUrl.searchParams.set('max_price', getPriceRange.max.toString());
      } else {
        // Services API
        apiUrl = new URL('/api/services', window.location.origin);
        apiUrl.searchParams.set('limit', itemsPerPage.toString());
        apiUrl.searchParams.set('offset', ((currentPage - 1) * itemsPerPage).toString());
      }

      console.log('🔍 Fetching from:', apiUrl.toString());
      
      const response = await fetch(apiUrl.toString(), requestOptions);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 API Response:', data);
      
      // Process response based on API type
      let serviceResults = [];
      let totalCount = 0;

      if (isSearchQuery) {
        // Search API response
        if (data.results && Array.isArray(data.results)) {
          serviceResults = data.results.filter(result => result.type === 'service');
          totalCount = data.total || serviceResults.length;
        }
      } else {
        // Services API response
        if (Array.isArray(data)) {
          serviceResults = data;
          totalCount = data.length;
        } else if (data.services && Array.isArray(data.services)) {
          serviceResults = data.services;
          totalCount = data.total || data.services.length;
        } else if (data.data && Array.isArray(data.data)) {
          serviceResults = data.data;
          totalCount = data.total || data.data.length;
        }
      }

      setServices(serviceResults);
      setTotalResults(totalCount);

      // Update search store if URL has query
      if (urlQuery && urlQuery !== searchQuery) {
        setSearchQuery(urlQuery);
      }

      console.log(`✅ Loaded ${serviceResults.length} services`);

    } catch (error) {
      console.error('❌ API Error:', error);
      setError(error.message);
      
      // 🔧 FIXED: Fallback data loading (this was the problematic line 139)
      await loadFallbackData();
      
    } finally {
      setLoading(false);
    }
  };

  // 🔧 FIXED: Separate fallback data function
  const loadFallbackData = async () => {
    try {
      console.log('🔄 Loading fallback data...');
      
      // 🚨 FIXED: Changed 'module' to 'productData' to avoid ESLint error
      const productData = await import("@/data/product");
      
      if (productData.service && Array.isArray(productData.service)) {
        setServices(productData.service);
        setTotalResults(productData.service.length);
        setError(null);
        console.log('✅ Fallback data loaded successfully');
      } else if (productData.default?.service && Array.isArray(productData.default.service)) {
        setServices(productData.default.service);
        setTotalResults(productData.default.service.length);
        setError(null);
        console.log('✅ Fallback data (default export) loaded successfully');
      } else {
        console.warn('⚠️ Fallback data structure unexpected:', productData);
        setServices([]);
        setTotalResults(0);
      }
    } catch (fallbackError) {
      console.error('❌ Fallback data failed:', fallbackError);
      setServices([]);
      setTotalResults(0);
      setError('Unable to load services data');
    }
  };

  // Fetch data effect
  useEffect(() => {
    fetchServices();
  }, [
    urlQuery, 
    urlType, 
    urlCategory, 
    searchQuery, 
    getSearch, 
    currentPage, 
    itemsPerPage,
    getPriceRange.min,
    getPriceRange.max,
    setSearchQuery
  ]);

  // Reset filters when component mounts
  useEffect(() => {
    resetAllFilters();
  }, [resetAllFilters]);

  // 🔧 ENHANCED: Filter functions with better error handling
  const createFilter = (filterFn, fallback = true) => (item) => {
    try {
      return filterFn(item);
    } catch (err) {
      console.warn('Filter error:', err);
      return fallback;
    }
  };

  const deliveryFilter = createFilter((item) =>
    getDeliveryTime === "" || getDeliveryTime === "anytime"
      ? true
      : item.deliveryTime === getDeliveryTime
  );

  const categoryFilter = createFilter((item) =>
    getCategory?.length !== 0 
      ? getCategory.includes(item.category) 
      : true
  );

  const priceFilter = createFilter((item) => {
    const price = item.price || item.base_price || 0;
    return getPriceRange.min <= price && getPriceRange.max >= price;
  });

  const levelFilter = createFilter((item) =>
    getLevel?.length !== 0 ? getLevel.includes(item.level) : true
  );

  const locationFilter = createFilter((item) =>
    getLocation?.length !== 0 ? getLocation.includes(item.location) : true
  );

  const searchFilter = createFilter((item) => {
    if (getSearch === "") return true;
    
    const searchTerm = getSearch.toLowerCase();
    const searchableFields = [
      item.title,
      item.name,
      item.category,
      item.description,
      item.tags?.join(' ')
    ].filter(Boolean);
    
    return searchableFields.some(field => 
      field.toLowerCase().includes(searchTerm)
    );
  });

  const sortByFilter = createFilter((item) =>
    getBestSeller === "" ? true : (getBestSeller === "best-seller" ? true : item.sort === getBestSeller)
  );

  const designToolFilter = createFilter((item) =>
    getDesginTool?.length !== 0 ? getDesginTool.includes(item.tool) : true
  );

  const speakFilter = createFilter((item) =>
    getSpeak?.length !== 0 ? getSpeak.includes(item.language) : true
  );

  // Apply all filters and sorting
  let filteredServices = services
    .filter(deliveryFilter)
    .filter(priceFilter)
    .filter(levelFilter)
    .filter(locationFilter)
    .filter(searchFilter)
    .filter(sortByFilter)
    .filter(designToolFilter)
    .filter(speakFilter)
    .filter(categoryFilter);

  // 🔧 ENHANCED: Improved sorting with error handling
  if (sortBy && filteredServices.length > 0) {
    filteredServices = [...filteredServices].sort((a, b) => {
      try {
        switch (sortBy) {
          case 'price-low':
            return (a.price || a.base_price || 0) - (b.price || b.base_price || 0);
          case 'price-high':
            return (b.price || b.base_price || 0) - (a.price || a.base_price || 0);
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'newest':
            return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
          case 'popular':
            return (b.reviews || b.review_count || 0) - (a.reviews || a.review_count || 0);
          default:
            return 0;
        }
      } catch (err) {
        console.warn('Sort error:', err);
        return 0;
      }
    });
  }

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // Retry function
  const retryFetch = () => {
    fetchServices();
  };

  // Get display title
  const getDisplayTitle = () => {
    if (urlQuery || searchQuery) {
      return `Search Results for "${urlQuery || searchQuery}"`;
    } else if (urlCategory) {
      return `Category: ${urlCategory}`;
    } else {
      return 'Explore Services';
    }
  };

  // Get results summary
  const getResultsSummary = () => {
    const hasActiveFilters = [
      getDeliveryTime,
      getLevel?.length > 0,
      getLocation?.length > 0,
      getSearch,
      getBestSeller,
      getDesginTool?.length > 0,
      getSpeak?.length > 0,
      getCategory?.length > 0,
      getPriceRange.min > 0,
      getPriceRange.max < 100000
    ].some(Boolean);

    if (loading) return 'Loading services...';
    
    if (filteredServices.length === 0 && services.length > 0) {
      return hasActiveFilters ? 'No services match your filters' : 'No services found';
    }
    
    return `${filteredServices.length} service${filteredServices.length !== 1 ? 's' : ''} found`;
  };

  // 🔧 ENHANCED: Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
      {[...Array(itemsPerPage)].map((_, i) => (
        <Card key={i} className="h-80 animate-pulse">
          <Skeleton className="h-52 w-full rounded-t-lg" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // 🔧 ENHANCED: Error state with better UX
  if (error && services.length === 0 && !loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Alert className="max-w-lg mx-auto border-destructive/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-4">
            <div>
              <h5 className="font-semibold mb-2 text-destructive">Unable to load services</h5>
              <p className="text-sm text-muted-foreground">{error}</p>
              <p className="text-xs text-muted-foreground mt-2">
                This might be a temporary connectivity issue. Please try again.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={retryFetch} size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="sm"
              >
                Refresh Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        
        {/* 🔧 ENHANCED: Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {getDisplayTitle()}
              </h1>
              
              {error && services.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Zap className="h-3 w-3" />
                  Using cached data
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{getResultsSummary()}</span>
              
              {totalResults > filteredServices.length && (
                <Badge variant="outline" className="text-xs">
                  {totalResults} total available
                </Badge>
              )}
              
              {urlQuery && (
                <Badge variant="default" className="text-xs gap-1">
                  <Search className="h-3 w-3" />
                  Search Active
                </Badge>
              )}
            </div>
          </div>
          
          {/* 🔧 ENHANCED: View Controls */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="gap-2 h-8"
              >
                <Grid3X3 className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-2 h-8"
              >
                <List className="h-4 w-4" />
                List
              </Button>
            </div>

            {/* Items per page */}
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8 per page</SelectItem>
                <SelectItem value="12">12 per page</SelectItem>
                <SelectItem value="16">16 per page</SelectItem>
                <SelectItem value="24">24 per page</SelectItem>
                <SelectItem value="48">48 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6">
          <Sift />
        </div>

        {/* 🔧 ENHANCED: Results Summary Bar */}
        {!loading && currentItems.length > 0 && (
          <div className="flex justify-between items-center mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredServices.length)} of {filteredServices.length}
              </span>
              
              {sortBy !== 'recommended' && (
                <Badge variant="outline" className="text-xs gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Sorted by {sortBy.replace('-', ' ')}
                </Badge>
              )}
            </div>
            
            {currentItems.length !== services.length && (
              <Button 
                onClick={resetAllFilters} 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-xs"
              >
                <Filter className="h-3 w-3" />
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSkeleton />}

        {/* Services Grid/List */}
        {!loading && (
          <>
            {currentItems.length > 0 ? (
              <div className={cn(
                "gap-6 mb-8",
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6"
                  : "flex flex-col space-y-4"
              )}>
                {currentItems.map((item, i) => (
                  <div key={item.id || item.service_id || `service-${i}`} className={cn(
                    "transition-all duration-200 hover:scale-[1.02]",
                    viewMode === 'list' && "max-w-none"
                  )}>
                    <Manifest data={item} viewMode={viewMode} />
                  </div>
                ))}
              </div>
            ) : (
              // 🔧 ENHANCED: Empty State
              <Card className="text-center py-16">
                <CardContent className="space-y-6">
                  <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">No services found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {services.length === 0 
                        ? "We couldn't find any services at the moment. Please try again later."
                        : "We couldn't find any services matching your criteria. Try adjusting your filters or search terms."
                      }
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {services.length > 0 && (
                      <Button onClick={resetAllFilters} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Clear All Filters
                      </Button>
                    )}
                    
                    <Button onClick={retryFetch} variant="outline" className="gap-2">
                      <Search className="h-4 w-4" />
                      Search Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Pagination */}
        {!loading && filteredServices.length > itemsPerPage && (
          <div className="mt-8">
            <Pagination1 
              totalItems={filteredServices.length} 
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              currentPage={currentPage}
            />
          </div>
        )}

        {/* 🔧 NEW: Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <details>
              <summary className="cursor-pointer font-medium">Debug Info</summary>
              <div className="mt-2 space-y-1">
                <div>Total services loaded: {services.length}</div>
                <div>Filtered services: {filteredServices.length}</div>
                <div>Current page: {currentPage}</div>
                <div>Items per page: {itemsPerPage}</div>
                <div>View mode: {viewMode}</div>
                <div>Sort by: {sortBy}</div>
                <div>Error: {error || 'None'}</div>
                <div>Loading: {loading ? 'Yes' : 'No'}</div>
              </div>
            </details>
          </div>
        )}

      </div>
    </div>
  );
}
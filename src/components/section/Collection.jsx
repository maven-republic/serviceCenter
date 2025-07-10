"use client";

import { useState, useEffect } from 'react';
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
  List
} from "lucide-react";

import listingStore from "@/store/listingStore";
import priceStore from "@/store/priceStore";
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('recommended');
  
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

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/services', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        });

        const contentType = response.headers.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Expected JSON, got ${contentType}: ${text}`);
        }

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 400 && errorText.includes('Professional ID')) {
            throw new Error('API_REQUIRES_PROFESSIONAL_ID');
          }
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setServices(data);
        } else if (data.services && Array.isArray(data.services)) {
          setServices(data.services);
        } else if (data.data && Array.isArray(data.data)) {
          setServices(data.data);
        } else {
          setServices([]);
        }

      } catch (error) {
        console.error('Error fetching services:', error);
        setError(error.message);
        
        // Fallback to static data
        try {
          const module = await import("@/data/product");
          if (module.service && Array.isArray(module.service)) {
            setServices(module.service);
            setError(null);
          } else {
            setServices([]);
          }
        } catch (fallbackError) {
          console.error('Fallback data failed:', fallbackError);
          setServices([]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
    resetAllFilters();
  }, [resetAllFilters]);

  // Filter functions
  const deliveryFilter = (item) =>
    getDeliveryTime === "" || getDeliveryTime === "anytime"
      ? item
      : item.deliveryTime === getDeliveryTime;

  const categoryFilter = (item) =>
    getCategory?.length !== 0 
      ? getCategory.includes(item.category) 
      : item;

  const priceFilter = (item) =>
    getPriceRange.min <= item.price && getPriceRange.max >= item.price;

  const levelFilter = (item) =>
    getLevel?.length !== 0 ? getLevel.includes(item.level) : item;

  const locationFilter = (item) =>
    getLocation?.length !== 0 ? getLocation.includes(item.location) : item;

  const searchFilter = (item) =>
    getSearch !== ""
      ? (item.title?.toLowerCase().includes(getSearch.toLowerCase()) || 
         item.category?.toLowerCase().includes(getSearch.toLowerCase()) ||
         item.description?.toLowerCase().includes(getSearch.toLowerCase()) ||
         item.name?.toLowerCase().includes(getSearch.toLowerCase()))
      : item;

  const sortByFilter = (item) =>
    getBestSeller === "" ? item : (getBestSeller === "best-seller" ? item : item.sort === getBestSeller);

  const designToolFilter = (item) =>
    getDesginTool?.length !== 0 ? getDesginTool.includes(item.tool) : item;

  const speakFilter = (item) =>
    getSpeak?.length !== 0 ? getSpeak.includes(item.language) : item;

  // Apply all filters and sorting
  let filteredServices = services
    .filter(getDeliveryTime ? deliveryFilter : () => true)
    .filter(getPriceRange.min !== 0 || getPriceRange.max !== 100000 ? priceFilter : () => true)
    .filter(getLevel?.length !== 0 ? levelFilter : () => true)
    .filter(getLocation?.length !== 0 ? locationFilter : () => true)
    .filter(getSearch !== "" ? searchFilter : () => true)
    .filter(getBestSeller !== "" ? sortByFilter : () => true)
    .filter(getDesginTool?.length !== 0 ? designToolFilter : () => true)
    .filter(getSpeak?.length !== 0 ? speakFilter : () => true)
    .filter(getCategory?.length !== 0 ? categoryFilter : () => true);

  // Apply sorting
  if (sortBy) {
    filteredServices = [...filteredServices].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'popular':
          return (b.reviews || 0) - (a.reviews || 0);
        default:
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
    window.location.reload();
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
      {[...Array(12)].map((_, i) => (
        <Card key={i} className="h-80">
          <Skeleton className="h-52 w-full" />
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

  // Error state
  if (error && services.length === 0) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Alert className="max-w-lg mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-4">
            <div>
              <h5 className="font-semibold mb-2">Unable to load services</h5>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button onClick={retryFetch} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Explore               {error && (
                
                <Badge variant="secondary" className="ml-3">
                  Using cached data
                </Badge>
              )}
            </h1>
            {/* <p className="text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                `${filteredServices.length} service${filteredServices.length !== 1 ? 's' : ''} found`
              )}
            </p> */}
          </div>
          
          {/* View Controls */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="gap-2"
              >
                <Grid3X3 className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-2"
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
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6">
          <Sift />
        </div>

        {/* Results Summary */}
        {!loading && currentItems.length > 0 && (
          <div className="flex justify-between items-center mb-4 text-sm text-muted-foreground">
            <span>
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredServices.length)} of {filteredServices.length}
            </span>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSkeleton />}

        {/* Services Grid */}
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
                  <div key={item.id || i} className={cn(
                    viewMode === 'list' && "max-w-none"
                  )}>
                    <Manifest data={item} />
                  </div>
                ))}
              </div>
            ) : (
              // Empty State
              <Card className="text-center py-12">
                <CardContent className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No services found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We couldn't find any services matching your criteria. Try adjusting your filters or search terms.
                  </p>
                  <Button onClick={resetAllFilters} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Pagination */}
        {!loading && filteredServices.length > 0 && (
          <div className="mt-8">
            <Pagination1 
              totalItems={filteredServices.length} 
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              currentPage={currentPage}
            />
          </div>
        )}

      </div>
    </div>
  );
}
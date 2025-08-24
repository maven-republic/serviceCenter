// src/components/discoveries/core/MasonryInfiniteScroll.jsx
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, AlertCircle, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Manifest from '../legacy/Manifest';

// Enhanced loading skeleton that matches your Manifest component structure
const MasonryLoadingSkeleton = ({ count = 4 }) => {
  // Variable heights matching your Manifest card variants
  const cardVariants = [
    { height: 'min-h-[240px]', variant: 'compact' },
    { height: 'min-h-[320px]', variant: 'standard' }, 
    { height: 'min-h-[400px]', variant: 'tall' },
    { height: 'min-h-[480px]', variant: 'extra-tall' }
  ];

  // Color palette backgrounds to match your Manifest design
  const colorPalettes = [
    'bg-blue-50',
    'bg-green-50', 
    'bg-purple-50',
    'bg-orange-50',
    'bg-pink-50',
    'bg-cyan-50',
    'bg-indigo-50',
    'bg-emerald-50'
  ];
  
  return (
    <>
      {[...Array(count)].map((_, i) => {
        const cardVariant = cardVariants[i % cardVariants.length];
        const bgColor = colorPalettes[i % colorPalettes.length];
        
        return (
          <div key={`loading-${i}`} className="break-inside-avoid mb-6">
            <Card className={`${cardVariant.height} border border-border/20 shadow-sm overflow-hidden ${bgColor}`}>
              <CardContent className="p-0 h-full flex flex-col">
                
                {/* Header Section - Matches your Manifest structure */}
                <div className="p-4 flex-shrink-0">
                  <div className="flex items-start justify-between mb-3">
                    
                    {/* Service Icon/Image placeholder */}
                    <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse flex-shrink-0"></div>
                    
                    {/* Like Button & Featured Badge area */}
                    <div className="flex items-center gap-2">
                      {/* Featured badge (sometimes) */}
                      {i % 3 === 0 && (
                        <div className="h-5 w-16 bg-yellow-200 rounded-full animate-pulse"></div>
                      )}
                      {/* Like button */}
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Service Title - 2 lines */}
                  <div className="space-y-2 mb-3">
                    <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                  </div>

                  {/* Category Badge */}
                  <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                </div>

                {/* Content Section - Variable based on card variant */}
                <div className="px-4 flex-1 flex flex-col justify-between">
                  
                  {/* Description - varies by card size */}
                  <div className="mb-4">
                    {cardVariant.variant === 'compact' ? (
                      // Compact: 2 lines
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                      </div>
                    ) : cardVariant.variant === 'standard' ? (
                      // Standard: 3 lines
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                      </div>
                    ) : (
                      // Tall/Extra-tall: More content
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        </div>
                        
                        {/* Extra content for tall cards */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <div className="h-3 w-3 bg-yellow-200 rounded animate-pulse"></div>
                            <div className="h-3 w-6 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        
                        {/* Extra features for extra-tall cards */}
                        {cardVariant.variant === 'extra-tall' && (
                          <div className="space-y-2">
                            <div className="h-3 w-16 bg-gray-300 rounded animate-pulse"></div>
                            <div className="flex flex-wrap gap-1">
                              <div className="h-4 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                              <div className="h-4 w-14 bg-gray-200 rounded-full animate-pulse"></div>
                              <div className="h-4 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Section - Matches your Manifest layout */}
                  <div className="space-y-3">
                    {/* Price and Duration */}
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="h-9 w-full bg-gray-300 rounded-md animate-pulse"></div>
                  </div>
                </div>

                {/* Bottom padding - matches your Manifest */}
                <div className="p-4 pt-0"></div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </>
  );
};

export default function MasonryInfiniteScroll({
  initialServices = [],
  fetchMoreServices,
  hasMore = true,
  loading = false,
  error = null,
  className = "",
  loadingThreshold = 300, // Pixels from bottom to trigger loading
  itemsPerPage = 12
}) {
  const [services, setServices] = useState(initialServices);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreItems, setHasMoreItems] = useState(hasMore);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const scrollContainerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Update services when initialServices changes
  useEffect(() => {
    setServices(initialServices);
    setCurrentPage(1);
    setHasMoreItems(hasMore);
  }, [initialServices, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        
        if (entry.isIntersecting && hasMoreItems && !isLoadingMore && !loading) {
          await loadMoreContent();
        }
      },
      {
        rootMargin: `${loadingThreshold}px`,
        threshold: 0.1
      }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [hasMoreItems, isLoadingMore, loading, loadingThreshold]);

  // Scroll to top detection
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadMoreContent = useCallback(async () => {
    if (!fetchMoreServices || isLoadingMore || !hasMoreItems) return;

    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      const newServices = await fetchMoreServices(nextPage, itemsPerPage);
      
      if (newServices && newServices.length > 0) {
        setServices(prev => [...prev, ...newServices]);
        setCurrentPage(nextPage);
        
        // Check if we have more items (if returned less than requested, probably no more)
        if (newServices.length < itemsPerPage) {
          setHasMoreItems(false);
        }
      } else {
        setHasMoreItems(false);
      }
    } catch (error) {
      console.error('Error loading more services:', error);
      setHasMoreItems(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchMoreServices, currentPage, itemsPerPage, isLoadingMore, hasMoreItems]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    setHasMoreItems(true);
    loadMoreContent();
  };

  if (loading && services.length === 0) {
    return (
      <div className={`columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-6 space-y-6 ${className}`}>
        <MasonryLoadingSkeleton count={8} />
      </div>
    );
  }

  if (error && services.length === 0) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Unable to load services</h3>
        <p className="text-gray-600 mb-6">
          There was a problem loading the services. Please try again.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div 
        ref={scrollContainerRef}
        className={`columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-6 space-y-6 ${className}`}
      >
        {services.map((service, index) => (
          <div key={`${service.service_id || service.id || index}-${currentPage}`} className="break-inside-avoid">
            <Manifest data={service} />
          </div>
        ))}

        {/* Loading More Skeleton */}
        {isLoadingMore && (
          <MasonryLoadingSkeleton count={4} />
        )}
      </div>

      {/* Intersection Observer Sentinel */}
      <div ref={sentinelRef} className="h-4 w-full" />

      {/* End of Results / Load More Button */}
      {!hasMoreItems && services.length > 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 text-gray-600">
            <div className="w-12 h-px bg-gray-300"></div>
            <span className="text-sm font-medium">You've seen it all!</span>
            <div className="w-12 h-px bg-gray-300"></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {services.length} services displayed
          </p>
        </div>
      )}

      {/* Error State for Loading More */}
      {error && services.length > 0 && (
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
          <p className="text-sm text-gray-600 mb-3">
            Couldn't load more services
          </p>
          <Button onClick={handleRetry} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading more services...</span>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300"
          size="icon"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}

// Hook for easy integration
export function useMasonryInfiniteScroll(initialData = [], fetchFunction) {
  const [services, setServices] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchMoreServices = async (page, limit) => {
    try {
      setLoading(true);
      setError(null);
      
      const newServices = await fetchFunction(page, limit);
      
      if (!newServices || newServices.length === 0) {
        setHasMore(false);
        return [];
      }
      
      return newServices;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetScroll = (newData = []) => {
    setServices(newData);
    setHasMore(true);
    setError(null);
  };

  return {
    services,
    loading,
    error,
    hasMore,
    fetchMoreServices,
    resetScroll
  };
}
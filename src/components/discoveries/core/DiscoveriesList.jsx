// src/components/discoveries/core/DiscoveriesList.jsx
// Masonry layout with infinite scroll using your beautiful Manifest component
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, AlertCircle, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Manifest from '../legacy/Manifest';

// Enhanced loading skeleton for masonry (matching your Manifest style)
const MasonryLoadingSkeleton = ({ count = 4 }) => {
  const heights = ['h-48', 'h-64', 'h-80', 'h-96'];
  
  return (
    <>
      {[...Array(count)].map((_, i) => {
        const height = heights[i % heights.length];
        return (
          <div key={`loading-${i}`} className="break-inside-avoid mb-6">
            <Card className={`${height} animate-pulse bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200`}>
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div className="flex-shrink-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex-shrink-0 space-y-3">
                  <div className="flex justify-between">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-9 w-full bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </>
  );
};

export default function DiscoveriesList({ 
  results = [], 
  viewMode = 'grid',
  onLoadMore = null,
  hasMore = false,
  loading = false,
  error = null,
  loadingThreshold = 300,
  itemsPerPage = 12
}) {
  const [displayedResults, setDisplayedResults] = useState(results);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const sentinelRef = useRef(null);

  console.log('🔍 DiscoveriesList rendering:', {
    resultsCount: results?.length || 0,
    displayedCount: displayedResults?.length || 0,
    viewMode,
    hasMore,
    loading
  });

  // Update displayed results when results change
  useEffect(() => {
    setDisplayedResults(results);
    setCurrentPage(1);
  }, [results]);

  // Intersection Observer for infinite scroll (only for grid mode)
  useEffect(() => {
    if (viewMode !== 'grid' || !onLoadMore || !hasMore) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        
        if (entry.isIntersecting && hasMore && !isLoadingMore && !loading) {
          await handleLoadMore();
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
  }, [hasMore, isLoadingMore, loading, viewMode, onLoadMore]);

  // Scroll to top detection
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (!onLoadMore || isLoadingMore || !hasMore || loading) return;

    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      console.log(`🔄 Loading page ${nextPage}...`);
      
      const newResults = await onLoadMore(nextPage, itemsPerPage);
      
      if (newResults && newResults.length > 0) {
        setDisplayedResults(prev => [...prev, ...newResults]);
        setCurrentPage(nextPage);
        console.log(`✅ Loaded ${newResults.length} more results`);
      } else {
        console.log('❌ No more results available');
      }
    } catch (error) {
      console.error('❌ Error loading more results:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [onLoadMore, currentPage, itemsPerPage, isLoadingMore, hasMore, loading]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    handleLoadMore();
  };

  // Safety check
  if (!displayedResults || !Array.isArray(displayedResults) || displayedResults.length === 0) {
    if (loading) {
      return (
        <div className="columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-6 space-y-6">
          <MasonryLoadingSkeleton count={8} />
        </div>
      );
    }

    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No services to display</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    // List view - Single column with horizontal cards (no infinite scroll)
    return (
      <div className="space-y-6">
        {displayedResults.map((result, index) => (
          <div 
            key={`${result.service_id || result.id || index}`}
            className="w-full"
          >
            <Manifest data={result} />
          </div>
        ))}
      </div>
    );
  }

  // 🎨 MASONRY GRID VIEW with Infinite Scroll
  return (
    <>
      <div className="columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-6 space-y-6">
        {displayedResults.map((result, index) => (
          <div 
            key={`${result.service_id || result.id || index}-${Math.floor(index / itemsPerPage)}`}
            className="w-full break-inside-avoid"
          >
            <Manifest data={result} />
          </div>
        ))}

        {/* Loading More Skeleton */}
        {isLoadingMore && (
          <MasonryLoadingSkeleton count={4} />
        )}
      </div>

      {/* Intersection Observer Sentinel (only show if we have onLoadMore function) */}
      {onLoadMore && <div ref={sentinelRef} className="h-4 w-full" />}

      {/* End of Results Message */}
      {!hasMore && displayedResults.length > 0 && onLoadMore && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 text-gray-600">
            <div className="w-12 h-px bg-gray-300"></div>
            <span className="text-sm font-medium">You've seen it all!</span>
            <div className="w-12 h-px bg-gray-300"></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {displayedResults.length} services displayed
          </p>
        </div>
      )}

      {/* Error State for Loading More */}
      {error && displayedResults.length > 0 && (
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
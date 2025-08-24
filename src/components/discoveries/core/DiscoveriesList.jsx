// src/components/discoveries/core/DiscoveriesList.jsx
// FIXED - Skeleton cards flow naturally in same masonry container

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, AlertCircle, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Manifest from '../legacy/Manifest';
import DiscoveriesLoading, { MasonrySkeletonCard } from './DiscoveriesLoading'; // ✅ Import individual skeleton

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

  // Safety check - Show loading state
  if (!displayedResults || !Array.isArray(displayedResults) || displayedResults.length === 0) {
    if (loading) {
      return <DiscoveriesLoading viewMode={viewMode} count={8} />;
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
        {/* Real service cards */}
        {displayedResults.map((result, index) => (
          <div 
            key={`${result.service_id || result.id || index}-${Math.floor(index / itemsPerPage)}`}
            className="w-full break-inside-avoid"
          >
            <Manifest data={result} />
          </div>
        ))}

        {/* 🎯 FIXED: Individual skeleton cards in same masonry flow */}
        {isLoadingMore && [...Array(4)].map((_, i) => (
          <MasonrySkeletonCard 
            key={`loading-skeleton-${i}`} 
            index={displayedResults.length + i} 
          />
        ))}
      </div>

      {/* Intersection Observer Sentinel */}
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
// Updated KeywordFilter.jsx with keyword-based search
"use client"

import React, { useState, useEffect } from 'react';
import { 
  Wrench, Zap, Hammer, Droplets, Car, Home, Cog, Flame, Settings,
  Construction, Shield, Sparkles, Factory, Coffee, X, Filter, 
  Truck, Gauge, Pipette, HardHat, Palette, Bath, Utensils, Building, 
  Bolt, Drill, Trees, Heart, Star, TrendingUp, Clock, Users, MapPin,
  ChevronLeft, ChevronRight, Loader2, Search, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSearch } from '../context/SearchContext';
import { cn } from '@/lib/utils';

// Enhanced icon mapping with more variety
const getKeywordIcon = (keyword) => {
  const term = keyword.toLowerCase();
  
  // Emergency services
  if (term.includes('emergency') || term.includes('24/7') || term.includes('urgent')) {
    return Truck;
  }
  
  // Water heater related
  if (term.includes('water heater') || term.includes('hot water') || term.includes('no hot water')) {
    return Flame;
  }
  
  // Plumbing related
  if (term.includes('toilet') || term.includes('flush')) {
    return Home;
  }
  if (term.includes('sink') || term.includes('faucet')) {
    return Droplets;
  }
  if (term.includes('shower') || term.includes('bathtub') || term.includes('bath')) {
    return Bath;
  }
  if (term.includes('sewer') || term.includes('drain') || term.includes('clogged')) {
    return Pipette;
  }
  if (term.includes('pipe') && (term.includes('repair') || term.includes('replacement'))) {
    return Wrench;
  }
  if (term.includes('plumbing') || term.includes('water') || term.includes('leak')) {
    return Droplets;
  }
  if (term.includes('pressure')) {
    return Gauge;
  }
  
  // Welding related
  if (term.includes('artistic') || term.includes('decorative')) {
    return Palette;
  }
  if (term.includes('steel') || term.includes('aluminum') || term.includes('metal')) {
    return Construction;
  }
  if (term.includes('welding') || term.includes('weld')) {
    return Sparkles;
  }
  if (term.includes('fabrication') || term.includes('custom')) {
    return Hammer;
  }
  
  // Automotive
  if (term.includes('automotive') || term.includes('vehicle')) {
    return Car;
  }
  
  // Kitchen/Commercial
  if (term.includes('kitchen') || term.includes('commercial')) {
    return Utensils;
  }
  
  // Construction
  if (term.includes('construction') || term.includes('building')) {
    return Building;
  }
  
  // Outdoor/Pool
  if (term.includes('outdoor') || term.includes('pool') || term.includes('irrigation')) {
    return Trees;
  }
  
  // Gas related
  if (term.includes('gas')) {
    return Flame;
  }
  
  // Electrical
  if (term.includes('electrical') || term.includes('electric')) {
    return Bolt;
  }
  
  // Default
  return Wrench;
};

const KeywordFilter = ({ className = "" }) => {
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const { 
    query, 
    setQuery, 
    performSearch,
    isLoading: searchLoading
  } = useSearch();

  const scrollContainerRef = React.useRef(null);

  // Fetch keywords from API
  useEffect(() => {
    fetchKeywords();
  }, []);

  // Sync with current query
  useEffect(() => {
    if (query && !selectedKeywords.includes(query)) {
      const matchingKeyword = keywords.find(k => 
        k.keyword.toLowerCase() === query.toLowerCase()
      );
      if (matchingKeyword) {
        setSelectedKeywords([matchingKeyword.keyword]);
      }
    }
  }, [query, selectedKeywords, keywords]);

  // Check scroll buttons visibility
  useEffect(() => {
    const checkScrollButtons = () => {
      const container = scrollContainerRef.current;
      if (container) {
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(
          container.scrollLeft < container.scrollWidth - container.clientWidth
        );
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons(); // Initial check
      
      // Check again after layout changes
      const resizeObserver = new ResizeObserver(checkScrollButtons);
      resizeObserver.observe(container);
      
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        resizeObserver.disconnect();
      };
    }
  }, [keywords]);

  const fetchKeywords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/search/keywords?limit=30&min_count=2');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch keywords: ${response.status}`);
      }
      
      const data = await response.json();
      setKeywords(data.keywords || []);
      
    } catch (err) {
      console.error('Failed to fetch keywords:', err);
      setError(err.message);
      
      // Beautiful fallback with trending topics
      setKeywords(generateFallbackKeywords());
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackKeywords = () => {
    return [
      { keyword: 'Emergency Services', service_count: 15, category: 'emergency', featured: true },
      { keyword: 'Plumbing Repair', service_count: 12, category: 'plumbing' },
      { keyword: 'Custom Welding', service_count: 8, category: 'welding', featured: true },
      { keyword: 'Water Heater', service_count: 6, category: 'plumbing' },
      { keyword: 'Drain Cleaning', service_count: 5, category: 'plumbing' },
      { keyword: 'Metal Fabrication', service_count: 7, category: 'welding' },
      { keyword: 'Kitchen Plumbing', service_count: 4, category: 'plumbing' },
      { keyword: 'Bathroom Repair', service_count: 5, category: 'plumbing' },
      { keyword: 'Artistic Welding', service_count: 3, category: 'welding', featured: true },
      { keyword: 'Commercial Services', service_count: 10, category: 'commercial' },
      { keyword: 'Outdoor Plumbing', service_count: 4, category: 'plumbing' },
      { keyword: 'Steel Welding', service_count: 6, category: 'welding' },
      { keyword: 'Gas Installation', service_count: 4, category: 'plumbing' },
      { keyword: 'Pipe Replacement', service_count: 5, category: 'plumbing' },
      { keyword: 'Construction Welding', service_count: 4, category: 'welding' }
    ];
  };

  const handleKeywordClick = async (keyword) => {
    const isSelected = selectedKeywords.includes(keyword.keyword);
    
    if (isSelected) {
      const newSelected = selectedKeywords.filter(k => k !== keyword.keyword);
      setSelectedKeywords(newSelected);
      
      if (setQuery && newSelected.length === 0) {
        setQuery('');
        performSearch('');
      }
    } else {
      setSelectedKeywords([keyword.keyword]);
      
      if (setQuery) {
        setQuery(keyword.keyword);
      }
      
      // Perform keyword search
      try {
        await performSearch(keyword.keyword, { 
          keywords: true, 
          fuzzy: false,
          limit: 50 
        });
      } catch (error) {
        console.error('Keyword search failed:', error);
      }
    }
  };

  const clearAllKeywords = () => {
    setSelectedKeywords([]);
    if (setQuery) {
      setQuery('');
    }
    if (performSearch) {
      performSearch('');
    }
  };

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className={cn("w-full mb-6", className)}>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading service categories...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && keywords.length === 0) {
    return (
      <div className={cn("w-full mb-6", className)}>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">Unable to load keywords</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchKeywords}
              className="ml-2"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full mb-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          
          
          {selectedKeywords.length > 0 && (
            <Badge variant="secondary" className="text-xs font-medium">
              {selectedKeywords.length} selected
            </Badge>
          )}
          
          {error && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
              Offline Mode
            </Badge>
          )}
        </div>
        
        {selectedKeywords.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllKeywords}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Scrollable Keywords Container */}
      <div className="relative group">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 p-0 rounded-full bg-background/95 backdrop-blur-sm border shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Right Scroll Button */}
        {canScrollRight && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 p-0 rounded-full bg-background/95 backdrop-blur-sm border shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Keywords Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: { display: 'none' }
          }}
        >
          {keywords.map((keyword, index) => {
            const isSelected = selectedKeywords.includes(keyword.keyword);
            const IconComponent = getKeywordIcon(keyword.keyword);
            
            return (
              <Button
                key={`${keyword.keyword}-${index}`}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleKeywordClick(keyword)}
                disabled={searchLoading}
                className={cn(
                  "relative flex-shrink-0 h-12 px-4 gap-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                  "text-sm font-medium border group",
                  isSelected 
                    ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20 border-primary" 
                    : "bg-background hover:bg-accent/50 border-border/50 hover:border-primary/30 hover:shadow-md"
                )}
              >
                {/* Special badges */}
                {keyword.featured && (
                  <div className="absolute -top-1 -right-1">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="h-2.5 w-2.5" />
                    </div>
                  </div>
                )}

                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isSelected 
                    ? "bg-primary-foreground/20" 
                    : "bg-muted group-hover:bg-primary/10"
                )}>
                  <IconComponent className="h-4 w-4" />
                </div>
                
                <div className="flex flex-col items-start min-w-0">
                  <span className="truncate max-w-[120px]">{keyword.keyword}</span>
                  {keyword.service_count && (
                    <span className={cn(
                      "text-xs",
                      isSelected 
                        ? "text-primary-foreground/70" 
                        : "text-muted-foreground"
                    )}>
                      {keyword.service_count} services
                    </span>
                  )}
                </div>
              </Button>
            );
          })}
          
          {/* End padding */}
          <div className="flex-shrink-0 w-4" />
        </div>

        {/* Gradient Overlays */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-[5]" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-[5]" />
        )}
      </div>

      {/* Selected Keywords Summary */}
      {selectedKeywords.length > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Search className="h-4 w-4 text-primary" />
              Active search:
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedKeywords.map((keyword) => {
                const keywordData = keywords.find(k => k.keyword === keyword);
                return (
                  <Badge 
                    key={keyword} 
                    variant="secondary" 
                    className="text-xs font-medium bg-primary/10 text-primary border-primary/20"
                  >
                    {keyword}
                    {keywordData?.service_count && (
                      <span className="ml-1 text-primary/70">
                        ({keywordData.service_count})
                      </span>
                    )}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
     
    </div>
  );
};

export default KeywordFilter;
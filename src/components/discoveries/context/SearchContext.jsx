// src/components/discoveries/context/SearchContext.jsx - UPDATED VERSION
'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const initialState = {
  query: '',
  results: [],
  filters: {
    minPrice: undefined,
    maxPrice: undefined,
    industry: undefined,
    vertical: undefined,
    parish: undefined,
    featured: false
  },
  isLoading: false,
  error: null,
  totalResults: 0,
  searchTimeMs: 0,
  usedFuzzy: false,
  usedKeywords: false,
  searchMethod: 'none',
  suggestions: []
};

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [state, setState] = useState(initialState);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load initial state from URL or fetch all services
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    const urlFilters = {
      minPrice: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
      maxPrice: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
      industry: searchParams.get('industry') || undefined,
      vertical: searchParams.get('vertical') || undefined,
      parish: searchParams.get('parish') || undefined,
      featured: searchParams.get('featured') === 'true'
    };

    // Update state with URL parameters
    setState(prev => ({
      ...prev,
      query: urlQuery || '',
      filters: urlFilters
    }));

    if (urlQuery) {
      // Perform search if there's a query
      performSearch(urlQuery, { keywords: true });
    } else {
      // Load all services by default
      loadAllServices();
    }
  }, []); // Only run once on mount

  const loadAllServices = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('📋 Loading all services...');
      
      const response = await fetch('/api/services?limit=100&sort=featured');
      
      if (!response.ok) {
        throw new Error(`Failed to load services: ${response.status}`);
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        results: data.services || [],
        totalResults: data.total || 0,
        searchTimeMs: data.searchTimeMs || 0,
        isLoading: false,
        query: '', // No search query, showing all services
        searchMethod: 'all_services'
      }));

      console.log(`✅ Loaded ${data.services?.length || 0} services`);

    } catch (error) {
      console.error('❌ Error loading services:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load services',
        isLoading: false,
        results: [],
        totalResults: 0
      }));
    }
  }, []);

  const setQuery = useCallback((query) => {
    setState(prev => ({ ...prev, query }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      filters: {
        minPrice: undefined,
        maxPrice: undefined,
        industry: undefined,
        vertical: undefined,
        parish: undefined,
        featured: false
      }
    }));
  }, []);

  const performSearch = useCallback(async (query, options = {}) => {
    // If empty query, reload all services
    if (!query || query.trim().length === 0) {
      loadAllServices();
      return;
    }

    if (query.trim().length < 2) {
      setState(prev => ({ 
        ...prev, 
        results: [], 
        totalResults: 0,
        error: null
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams({
        q: query.trim(),
        fuzzy: String(options.fuzzy || false),
        keywords: String(options.keywords || false),
        limit: String(options.limit || 50)
      });

      // Add current filters to search
      Object.entries(state.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          const paramKey = key === 'minPrice' ? 'min_price' : 
                          key === 'maxPrice' ? 'max_price' : key;
          params.set(paramKey, String(value));
        }
      });

      console.log('🔍 SearchContext performing search:', {
        query: query.trim(),
        options,
        url: `/api/search?${params.toString()}`
      });

      const response = await fetch(`/api/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      console.log('✅ SearchContext received response:', {
        total: data.total,
        usedKeywords: data.usedKeywords,
        searchMethod: data.searchMethod,
        resultsCount: data.results?.length
      });

      setState(prev => ({
        ...prev,
        query: query.trim(),
        results: data.results || [],
        totalResults: data.total || 0,
        searchTimeMs: data.searchTimeMs || 0,
        usedFuzzy: data.usedFuzzy || false,
        usedKeywords: data.usedKeywords || false,
        searchMethod: data.searchMethod || 'unknown',
        isLoading: false,
        error: null
      }));

      // Update URL with search parameters
      updateURL(query.trim(), state.filters);

    } catch (error) {
      console.error('❌ Search error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Search failed',
        isLoading: false,
        results: [],
        totalResults: 0
      }));
    }
  }, [state.filters, loadAllServices]);

  const getSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setState(prev => ({ ...prev, suggestions: [] }));
      return;
    }

    try {
      console.log('💡 Getting suggestions for:', query);
      
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(query)}&limit=8&include_services=true`
      );
      
      if (!response.ok) {
        throw new Error(`Suggestions failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        suggestions: data.suggestions || []
      }));

      console.log(`✅ Got ${data.suggestions?.length || 0} suggestions`);
      
    } catch (error) {
      console.error('❌ Suggestions error:', error);
      setState(prev => ({ ...prev, suggestions: [] }));
    }
  }, []);

  const clearAll = useCallback(() => {
    setState(initialState);
    router.push('/customer/workspace');
    // Reload all services after clearing
    setTimeout(() => loadAllServices(), 100);
  }, [router, loadAllServices]);

  const updateURL = useCallback((query, filters) => {
    const params = new URLSearchParams();
    
    if (query) params.set('q', query);
    if (filters.minPrice) params.set('min_price', String(filters.minPrice));
    if (filters.maxPrice) params.set('max_price', String(filters.maxPrice));
    if (filters.industry) params.set('industry', filters.industry);
    if (filters.vertical) params.set('vertical', filters.vertical);
    if (filters.parish) params.set('parish', filters.parish);
    if (filters.featured) params.set('featured', 'true');

    const queryString = params.toString();
    const newUrl = `/customer/workspace${queryString ? `?${queryString}` : ''}`;
    
    // Only update URL if it's different
    if (window.location.pathname + window.location.search !== newUrl) {
      router.push(newUrl);
    }
  }, [router]);

  // Method to refresh current search
  const refreshSearch = useCallback(() => {
    if (state.query) {
      performSearch(state.query, { keywords: state.usedKeywords });
    } else {
      loadAllServices();
    }
  }, [state.query, state.usedKeywords, performSearch, loadAllServices]);

  const contextValue = {
    // State
    ...state,
    
    // Actions
    setQuery,
    updateFilters,
    clearFilters,
    performSearch,
    getSuggestions,
    clearAll,
    loadAllServices,
    refreshSearch,
    
    // Computed values
    hasResults: state.results.length > 0,
    hasQuery: state.query.length > 0,
    hasFilters: Object.values(state.filters).some(v => 
      v !== undefined && v !== null && v !== '' && v !== false
    ),
    isEmpty: !state.isLoading && !state.error && state.results.length === 0
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
}

// Export for debugging
export { SearchContext };
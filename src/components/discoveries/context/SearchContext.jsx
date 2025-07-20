// src/components/discoveries/context/SearchContext.jsx
'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const initialState = {
  query: '',
  results: [],
  filters: {},
  isLoading: false,
  error: null,
  totalResults: 0,
  searchTimeMs: 0,
  usedFuzzy: false,
  suggestions: []
};

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [state, setState] = useState(initialState);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load all services by default on mount
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

    if (urlQuery || Object.values(urlFilters).some(Boolean)) {
      setState(prev => ({
        ...prev,
        query: urlQuery || '',
        filters: urlFilters
      }));

      if (urlQuery) {
        performSearch(urlQuery);
      }
    } else {
      // Load all services by default if no URL params
      loadAllServices();
    }
  }, []);

  const loadAllServices = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/services');
      
      if (!response.ok) {
        throw new Error(`Failed to load services: ${response.status}`);
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        results: data.services || data || [],
        totalResults: data.total || (data.services || data || []).length,
        isLoading: false,
        query: '' // No search query, showing all services
      }));

    } catch (error) {
      console.error('Error loading services:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load services',
        isLoading: false
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

  const performSearch = useCallback(async (query, options = {}) => {
    // If empty query, reload all services
    if (!query || query.trim().length === 0) {
      loadAllServices();
      return;
    }

    if (query.trim().length < 2) {
      setState(prev => ({ ...prev, results: [], totalResults: 0 }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams({
        q: query.trim(),
        fuzzy: options.fuzzy ? 'true' : 'false'
      });

      // Add filters to search
      Object.entries(state.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key === 'minPrice' ? 'min_price' : 
                    key === 'maxPrice' ? 'max_price' : key, 
                    value.toString());
        }
      });

      const response = await fetch(`/api/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        query: query.trim(),
        results: data.results || [],
        totalResults: data.total || 0,
        searchTimeMs: data.searchTimeMs || 0,
        usedFuzzy: data.usedFuzzy || false,
        isLoading: false
      }));

      // Update URL
      updateURL(query.trim(), state.filters);

    } catch (error) {
      console.error('Search error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Search failed',
        isLoading: false
      }));
    }
  }, [state.filters, loadAllServices]);

  const getSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setState(prev => ({ ...prev, suggestions: [] }));
      return;
    }

    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        suggestions: data.suggestions || []
      }));
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  }, []);

  const clearAll = useCallback(() => {
    setState(initialState);
    router.push('/customer/workspace');
    // Reload all services after clearing
    setTimeout(() => loadAllServices(), 100);
  }, [router, loadAllServices]);

  const clearFilters = useCallback(() => {
    setState(prev => ({ ...prev, filters: {} }));
  }, []);

  const updateURL = useCallback((query, filters) => {
    const params = new URLSearchParams();
    
    if (query) params.set('q', query);
    if (filters.minPrice) params.set('min_price', filters.minPrice.toString());
    if (filters.maxPrice) params.set('max_price', filters.maxPrice.toString());
    if (filters.industry) params.set('industry', filters.industry);
    if (filters.vertical) params.set('vertical', filters.vertical);
    if (filters.parish) params.set('parish', filters.parish);
    if (filters.featured) params.set('featured', 'true');

    const queryString = params.toString();
    router.push(`/customer/workspace${queryString ? `?${queryString}` : ''}`);
  }, [router]);

  return (
    <SearchContext.Provider value={{
      ...state,
      setQuery,
      updateFilters,
      performSearch,
      getSuggestions,
      clearAll,
      clearFilters,
      loadAllServices
    }}>
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
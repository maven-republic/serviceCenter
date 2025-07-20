// ============================================================================
// 7️⃣ COMBINED SEARCH HOOK (Main Hook)
// File: src/components/customer-workspace/element/search/primitives/useSearch.js
import { useCallback } from 'react';
import { useAdvancedSearch } from './useAdvancedSearch';
import { useSearchTelemetry } from './useSearchTelemetry';
import { useSearchHistory } from './useSearchHistory';
import { useSearchFilters } from './useSearchFilters';

export function useSearch() {
  const { 
    searchServices, 
    loading, 
    results, 
    totalResults, 
    error, 
    clearResults 
  } = useAdvancedSearch();
  
  const { logSearch } = useSearchTelemetry();
  const { addToHistory } = useSearchHistory();
  const { filters, buildFilterQuery } = useSearchFilters();

  const performSearch = useCallback(async (query, options = {}) => {
    if (!query || query.trim().length < 2) {
      clearResults();
      return { results: [], totalResults: 0 };
    }

    const trimmedQuery = query.trim();
    
    // Perform the search
    const searchResult = await searchServices({
      query: trimmedQuery,
      maxResults: options.maxResults || 20,
      includeInactive: options.includeInactive || false,
      useFuzzy: options.useFuzzy || false,
      similarityThreshold: options.similarityThreshold || 0.3,
      ...buildFilterQuery()
    });

    // Log the search for telemetry
    if (searchResult && !searchResult.error) {
      await logSearch({
        query: trimmedQuery,
        resultsCount: searchResult.totalResults,
        searchTimeMs: searchResult.searchTimeMs,
        filtersApplied: buildFilterQuery()
      });

      // Add to search history
      addToHistory(trimmedQuery);
    }

    return searchResult;
  }, [searchServices, logSearch, addToHistory, buildFilterQuery, clearResults]);

  return {
    performSearch,
    loading,
    results,
    totalResults,
    error,
    clearResults,
    filters
  };
}
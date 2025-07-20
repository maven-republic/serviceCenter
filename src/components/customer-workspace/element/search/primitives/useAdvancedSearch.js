
// ============================================================================
// 3️⃣ ADVANCED SEARCH HOOK (uses your new DB functions)
// File: src/components/customer-workspace/element/search/primitives/useAdvancedSearch.js
import { useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client'; // Use your custom client

export function useAdvancedSearch() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState(null);

  const searchServices = useCallback(async ({
    query,
    maxResults = 20,
    includeInactive = false,
    useFuzzy = false,
    similarityThreshold = 0.3
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const startTime = performance.now();
      const supabase = createClient(); // Create client instance
      
      // Choose search function based on fuzzy setting
      const functionName = useFuzzy ? 'search_services_fuzzy' : 'search_services';
      
      const params = useFuzzy ? {
        search_query: query,
        max_results: maxResults,
        similarity_threshold: similarityThreshold
      } : {
        search_query: query,
        max_results: maxResults,
        include_inactive: includeInactive
      };

      const { data, error: searchError } = await supabase.rpc(functionName, params);

      if (searchError) {
        throw searchError;
      }

      const endTime = performance.now();
      const searchTime = Math.round(endTime - startTime);

      setResults(data || []);
      setTotalResults(data?.length || 0);
      
      return {
        results: data || [],
        totalResults: data?.length || 0,
        searchTimeMs: searchTime
      };

    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      setResults([]);
      setTotalResults(0);
      return {
        results: [],
        totalResults: 0,
        searchTimeMs: 0,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  }, []); // Remove supabase dependency

  const refreshSearchView = useCallback(async () => {
    try {
      const supabase = createClient(); // Create client instance
      const { error } = await supabase.rpc('refresh_search_view');
      if (error) {
        throw error;
      }
      return true;
    } catch (err) {
      console.error('Failed to refresh search view:', err);
      return false;
    }
  }, []); // Remove supabase dependency

  const clearResults = useCallback(() => {
    setResults([]);
    setTotalResults(0);
    setError(null);
  }, []);

  return {
    loading,
    results,
    totalResults,
    error,
    searchServices,
    refreshSearchView,
    clearResults
  };
}
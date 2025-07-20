import { useCallback } from 'react';
import { createClient } from '@/utils/supabase/client'; // Use your custom client

export function useSearchTelemetry() {
  const logSearch = useCallback(async ({
    query,
    resultsCount = 0,
    searchTimeMs = null,
    filtersApplied = null, // Now we can track filters!
    userAccountId = null,
    userSessionId = null
  }) => {
    try {
      // Validate inputs
      if (!query || typeof query !== 'string') {
        console.warn('Search telemetry: Invalid query provided');
        return null;
      }

      // Get Supabase client instance
      const supabase = createClient();
      
      if (!supabase) {
        console.warn('Search telemetry: Supabase client not available');
        return null;
      }

      // Call your log_search function with proper parameter names (including filters)
      const { data, error } = await supabase.rpc('log_search', {
        p_query: query,
        p_results_count: resultsCount,
        p_user_account_id: userAccountId,
        p_user_session_id: userSessionId,
        p_search_time_ms: searchTimeMs,
        p_filters_applied: filtersApplied // Now we can use this!
      });

      if (error) {
        console.error('Failed to log search:', {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          query: query
        });
        return null;
      }

      return data;
    } catch (err) {
      console.error('Search telemetry error:', {
        message: err.message,
        stack: err.stack,
        query: query
      });
      return null;
    }
  }, []); // No dependencies needed since we create client inside

  const getPopularSearches = useCallback(async (daysBack = 7) => {
    try {
      const supabase = createClient();
      
      if (!supabase) {
        console.warn('Popular searches: Supabase client not available');
        return [];
      }

      // First, try to get from a view if it exists
      let { data, error } = await supabase
        .from('popular_searches')
        .select('*')
        .limit(10);

      // If view doesn't exist, query telemetry table directly
      if (error && error.code === '42P01') { // Table/view does not exist
        const { data: telemetryData, error: telemetryError } = await supabase
          .from('telemetry')
          .select('normalized_query, COUNT(*) as search_count')
          .gte('created_at', new Date(Date.now() - (daysBack * 24 * 60 * 60 * 1000)).toISOString())
          .not('normalized_query', 'is', null)
          .order('search_count', { ascending: false })
          .limit(10);

        if (telemetryError) {
          console.error('Failed to get popular searches from telemetry:', telemetryError);
          return [];
        }

        return telemetryData || [];
      }

      if (error) {
        console.error('Failed to get popular searches:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Popular searches error:', err);
      return [];
    }
  }, []); // No dependencies needed since we create client inside

  // Function to test if telemetry is working
  const testTelemetry = useCallback(async () => {
    try {
      const testResult = await logSearch({
        query: 'test search',
        resultsCount: 1,
        searchTimeMs: 100
      });
      
      if (testResult) {
        console.log('✅ Telemetry is working correctly');
        return true;
      } else {
        console.warn('⚠️ Telemetry test failed - check database function');
        return false;
      }
    } catch (err) {
      console.error('❌ Telemetry test error:', err);
      return false;
    }
  }, [logSearch]); // logSearch is stable since it has no dependencies

  return {
    logSearch,
    getPopularSearches,
    testTelemetry
  };
}
// ============================================================================
// 4️⃣ SEARCH SUGGESTIONS HOOK
// File: src/components/customer-workspace/element/search/primitives/useSearchSuggestions.js
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client'; // Use your custom client

export function useSearchSuggestions(category = 'all', limit = 6) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient(); // Create client instance
      let query = supabase
        .from('service')
        .select(`
          service_id,
          name,
          description,
          is_featured,
          portfolio:portfolio_id (
            name,
            vertical:vertical_id (
              name,
              industry:industry_id (
                name
              )
            )
          )
        `)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('name', { ascending: true })
        .limit(limit);

      // Add category filtering if specified
      if (category !== 'all') {
        // You can expand this based on your category mapping
        const categoryKeywords = {
          plumbing: ['plumbing', 'water', 'pipe', 'drain'],
          welding: ['welding', 'metal', 'steel', 'fabrication'],
          emergency: ['emergency', 'urgent', '24/7']
        };

        if (categoryKeywords[category]) {
          // This is a simplified approach - you might want to use a more sophisticated filter
          query = query.ilike('name', `%${categoryKeywords[category][0]}%`);
        }
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Transform data into suggestion format
      const transformedSuggestions = (data || []).map(service => ({
        type: 'service',
        title: service.name,
        category: service.portfolio?.vertical?.industry?.name || 'General',
        searchTerm: service.name,
        serviceId: service.service_id,
        isFeatured: service.is_featured,
        description: service.description
      }));

      setSuggestions(transformedSuggestions);

    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
      setError(err.message);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [category, limit]); // Remove supabase dependency

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const refreshSuggestions = useCallback(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return {
    suggestions,
    loading,
    error,
    refreshSuggestions
  };
}

// ============================================================================
// UPDATED: src/primitives/customer/useSearchSuggestions.js
// ============================================================================

import { useState, useEffect } from 'react';

export function useSearchSuggestions(type = 'all', limit = 6) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Hook: Fetching suggestions...', { type, limit });

        const params = new URLSearchParams({
          type,
          limit: limit.toString()
        });

        const url = `/api/search/suggestions?${params}`;
        console.log('📡 Hook: API URL:', url);

        const response = await fetch(url);
        
        console.log('📡 Hook: Response status:', response.status);
        console.log('📡 Hook: Response OK:', response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Hook: API Error:', errorText);
          throw new Error(`API returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Hook: API Response:', data);

        if (data.suggestions && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
          console.log('✅ Hook: Set suggestions:', data.suggestions.length);
          
          // Log any warnings
          if (data.source === 'fallback' || data.source === 'error_fallback') {
            console.warn('⚠️ Hook: Using fallback suggestions');
          }
          if (data.dbError) {
            console.warn('⚠️ Hook: Database error:', data.dbError);
          }
        } else {
          console.error('❌ Hook: Invalid suggestions format:', data);
          throw new Error('Invalid suggestions format received');
        }

      } catch (err) {
        console.error('❌ Hook: Error fetching suggestions:', err);
        setError(err.message);
        
        // Enhanced fallback with more variety
        const fallbackSuggestions = [
          { type: 'service', title: 'Web Development', category: 'Technology', searchTerm: 'web development' },
          { type: 'service', title: 'Home Cleaning', category: 'Home Services', searchTerm: 'home cleaning' },
          { type: 'category', title: 'Photography', category: 'Creative', searchTerm: 'photography' },
          { type: 'category', title: 'Landscaping', category: 'Outdoor', searchTerm: 'landscaping' },
          { type: 'service', title: 'Tutoring', category: 'Education', searchTerm: 'tutoring' },
          { type: 'service', title: 'Graphic Design', category: 'Creative', searchTerm: 'graphic design' }
        ];
        
        setSuggestions(fallbackSuggestions);
        console.log('🔄 Hook: Using local fallback suggestions:', fallbackSuggestions.length);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [type, limit]);

  return { suggestions, loading, error };
}
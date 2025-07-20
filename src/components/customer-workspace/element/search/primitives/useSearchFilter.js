// ============================================================================
// 5️⃣ SEARCH FILTERS HOOK
// File: src/components/customer-workspace/element/search/primitives/useSearchFilters.js
import { useState, useCallback } from 'react';

export function useSearchFilters() {
  const [filters, setFilters] = useState({
    category: null,
    priceRange: null,
    availability: null,
    location: null,
    featured: false,
    emergency: false
  });

  const updateFilter = useCallback((filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  }, []);

  const clearFilter = useCallback((filterKey) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: null
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      category: null,
      priceRange: null,
      availability: null,
      location: null,
      featured: false,
      emergency: false
    });
  }, []);

  const getActiveFiltersCount = useCallback(() => {
    return Object.values(filters).filter(value => 
      value !== null && value !== false && value !== ''
    ).length;
  }, [filters]);

  const buildFilterQuery = useCallback(() => {
    const activeFilters = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== false && value !== '') {
        activeFilters[key] = value;
      }
    });

    return activeFilters;
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    getActiveFiltersCount,
    buildFilterQuery
  };
}
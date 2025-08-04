// ============================================================================
// 🔍 SEARCH COMPONENTS ARCHITECTURE (UPDATED PATHS)
// ============================================================================

// 1️⃣ MAIN UNIVERSAL SEARCH COMPONENT
// File: src/components/customer-workspace/element/UniversalSearch.jsx
import { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSearchAnalysis } from './search/primitives/useSearchAnalysis';
import { useSearchTelemetry } from './search/primitives/useSearchTelemetry';
import SearchSuggestionDropdown from './search/SearchSuggestionDropdown';
import SearchConfigProvider from './search/SearchConfigProvider';
import SearchInputField from './search/SearchInputField';

export default function UniversalSearch({ 
  onSearch, 
  onClear,
  value = '',
  className = '',
  placeholder = 'Search for any service...',
  size = 'large',
  showSuggestions = true,
  showFilters = false,
  variant = 'default'
}) {
  const [query, setQuery] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  
  const { analysis, smartSuggestions } = useSearchAnalysis(query);
  const { logSearch } = useSearchTelemetry();

  // Sync with external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Also add this useEffect to monitor state changes
useEffect(() => {
  console.log('🔍 Query state changed:', query);
  console.log('🔍 Value prop:', value);
}, [query, value]);

// And this one to monitor the value prop
useEffect(() => {
  console.log('🔄 Value prop changed, syncing to query:', value);
  setQuery(value);
}, [value]);


  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (query.trim()) {
      const startTime = performance.now();
      
      // Call your backend search
      const results = await onSearch?.(query.trim(), { analysis, smartSuggestions });
      
      const endTime = performance.now();
      const searchTime = Math.round(endTime - startTime);
      
      // Log search telemetry
      await logSearch({
        query: query.trim(),
        resultsCount: results?.length || 0,
        searchTimeMs: searchTime,
        filtersApplied: analysis.isEmergency ? { emergency: true } : null
      });
      
      setIsFocused(false);
    }
  };

 const handleClear = () => {
  console.log('🧹 Clear button clicked');
  console.log('🧹 Before clear - query:', query);
  
  setQuery('');
  onClear?.();
  onSearch?.('');
  
  console.log('🧹 After clear - query should be empty');
};

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setQuery(suggestion.searchTerm);
    const results = await onSearch?.(suggestion.searchTerm, { 
      analysis, 
      type: suggestion.type 
    });
    
    // Log suggestion click
    await logSearch({
      query: suggestion.searchTerm,
      resultsCount: results?.length || 0,
      filtersApplied: { suggestionType: suggestion.type }
    });
    
    setIsFocused(false);
  };

  return (
    <SearchConfigProvider size={size} variant={variant}>
      <div className={cn('relative w-full', className)}>
        <div className="relative">
          <SearchInputField
            query={query}
            setQuery={setQuery}
            placeholder={placeholder}
            isFocused={isFocused}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            onKeyDown={handleKeyDown}
            onClear={handleClear}
            onSubmit={handleSubmit}
            showFilters={showFilters}
          />
        </div>

        {showSuggestions && (
          <SearchSuggestionDropdown
            query={query}
            isFocused={isFocused}
            analysis={analysis}
            smartSuggestions={smartSuggestions}
            onSuggestionClick={handleSuggestionClick}
          />
        )}
      </div>
    </SearchConfigProvider>
  );
}
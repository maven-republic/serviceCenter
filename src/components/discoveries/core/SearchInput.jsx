// src/components/search/SearchInput.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/components/discoveries/context/SearchContext';
import { useDebouncedCallback } from 'use-debounce';

export default function SearchInput({ 
  placeholder = "Search services...",
  className = "",
  size = 'md',
  showSuggestions = true
}) {
  const { 
    query, 
    isLoading, 
    suggestions,
    setQuery, 
    performSearch, 
    getSuggestions,
    clearAll 
  } = useSearch();
  
  const [localQuery, setLocalQuery] = useState(query);
  const [showSuggestionDropdown, setShowSuggestionDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounced search and suggestions
  const debouncedSearch = useDebouncedCallback((q) => {
    if (q.length > 2) {
      performSearch(q, { fuzzy: true });
    }
  }, 300);

  const debouncedSuggestions = useDebouncedCallback((q) => {
    if (q.length > 1 && showSuggestions) {
      getSuggestions(q);
    }
  }, 200);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleInputChange = (value) => {
    setLocalQuery(value);
    setQuery(value);
    setFocusedIndex(-1);
    
    if (value.length > 1) {
      debouncedSuggestions(value);
      if (value.length > 2) {
        debouncedSearch(value);
      }
      setShowSuggestionDropdown(true);
    } else {
      setShowSuggestionDropdown(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      performSearch(localQuery.trim());
      setShowSuggestionDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    clearAll();
    setShowSuggestionDropdown(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    setLocalQuery(suggestion);
    setQuery(suggestion);
    performSearch(suggestion);
    setShowSuggestionDropdown(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestionDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[focusedIndex].suggestion);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestionDropdown(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const sizeClasses = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-base', 
    lg: 'h-14 text-lg'
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        
        <Input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (localQuery.length > 1 && suggestions.length > 0) {
              setShowSuggestionDropdown(true);
            }
          }}
          onBlur={(e) => {
            // Delay hiding to allow clicks on suggestions
            setTimeout(() => {
              if (!dropdownRef.current?.contains(document.activeElement)) {
                setShowSuggestionDropdown(false);
              }
            }, 150);
          }}
          placeholder={placeholder}
          className={`${sizeClasses[size]} pl-10 pr-10 ${
            showSuggestionDropdown ? 'rounded-b-none' : ''
          }`}
        />

        {/* Loading spinner */}
        {isLoading && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}

        {/* Clear button */}
        {localQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {/* Suggestions dropdown */}
      {showSuggestionDropdown && suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 bg-white border border-t-0 border-input rounded-b-md shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.suggestion}-${index}`}
              type="button"
              onClick={() => handleSuggestionClick(suggestion.suggestion)}
              className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors ${
                index === focusedIndex ? 'bg-muted' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{suggestion.suggestion}</span>
                <span className="text-xs text-muted-foreground">
                  {suggestion.suggestion_type === 'popular' ? 'Popular' : 'Service'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
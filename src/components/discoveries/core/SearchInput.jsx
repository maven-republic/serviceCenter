// src/components/discoveries/core/SearchInput.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSearch } from '../context/SearchContext';
import { useDebouncedCallback } from 'use-debounce';
import { cn } from '@/lib/utils';

export default function SearchInput({ 
  placeholder = "Search for services, professionals, or industries...",
  className = "",
  size = 'lg',
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
    lg: 'h-16 text-lg'
  };

  return (
    <div className={cn("w-full max-w-7xl mx-auto", className)}>
      <div className="relative">
        <form onSubmit={handleSubmit} className="relative">
          {/* Search Icon */}
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          
          {/* Main Input */}
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
            className={cn(
              sizeClasses[size], 
              "pl-12 pr-24 text-base bg-background border-input",
              "focus:ring-0 focus:ring-offset-0 focus-visible:ring-1 focus-visible:ring-ring",
              showSuggestionDropdown ? 'rounded-b-none border-b-0' : ''
            )}
          />

          {/* Right Side Icons */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Loading spinner */}
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}

            {/* Clear button */}
            {localQuery && !isLoading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 w-8 p-0 hover:bg-muted/50"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}

            {/* Search button for mobile */}
            <Button
              type="submit"
              size="sm"
              className="h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Search className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </div>
        </form>

        {/* Flat Suggestions Dropdown */}
        {showSuggestionDropdown && suggestions.length > 0 && (
          <div 
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 bg-background border border-t-0 border-input rounded-b-lg z-50 max-h-64 overflow-y-auto"
          >
            <div className="p-2">
              <div className="text-xs text-muted-foreground mb-2 px-2 py-1">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.suggestion}-${index}`}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion.suggestion)}
                  className={cn(
                    "w-full px-3 py-2 text-left rounded-md transition-colors",
                    "hover:bg-muted/50 focus:bg-muted/50",
                    index === focusedIndex && 'bg-muted/50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-foreground">{suggestion.suggestion}</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-muted text-muted-foreground border-0"
                    >
                      {suggestion.suggestion_type === 'popular' ? 'Popular' : 'Service'}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
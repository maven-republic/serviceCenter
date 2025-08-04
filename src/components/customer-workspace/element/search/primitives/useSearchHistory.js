// ============================================================================
// 6️⃣ SEARCH HISTORY HOOK
// File: src/components/customer-workspace/element/search/primitives/useSearchHistory.js
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

export function useSearchHistory() {
  const [history, setHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      console.error('Failed to load search history:', err);
      setHistory([]);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (err) {
      console.error('Failed to save search history:', err);
    }
  }, [history]);

  const addToHistory = useCallback((query) => {
    if (!query || query.trim().length < 2) return;

    const trimmedQuery = query.trim();
    
    setHistory(prev => {
      // Remove existing entry if it exists
      const filtered = prev.filter(item => item.query !== trimmedQuery);
      
      // Add new entry at the beginning
      const newHistory = [{
        query: trimmedQuery,
        timestamp: Date.now(),
        id: Date.now().toString()
      }, ...filtered];

      // Keep only the most recent items
      return newHistory.slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

  const removeFromHistory = useCallback((queryOrId) => {
    setHistory(prev => prev.filter(item => 
      item.query !== queryOrId && item.id !== queryOrId
    ));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getRecentSearches = useCallback((limit = 5) => {
    return history.slice(0, limit);
  }, [history]);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getRecentSearches
  };
}

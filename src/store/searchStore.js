// src/store/searchStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSearchStore = create(
  persist(
    (set, get) => ({
      // Search State
      searchQuery: '',
      searchResults: [],
      searchType: 'all', // all, services, professionals, categories
      isSearching: false,
      searchError: null,
      totalResults: 0,
      hasMoreResults: false,
      
      // Pagination
      currentPage: 1,
      resultsPerPage: 20,
      offset: 0,
      
      // Filters
      filters: {
        parish: null,
        industry_id: null,
        vertical_id: null,
        min_price: null,
        max_price: null,
        verification_status: null,
        rating_min: null,
      },
      
      // Recent Searches (persisted)
      recentSearches: [],
      
      // Search Suggestions
      suggestions: [],
      isFetchingSuggestions: false,
      
      // Address storage (ADDED - for AddressConfirmation component)
      confirmedAddress: null,
      
      // Basic Actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setSearchType: (type) => set({ 
        searchType: type,
        currentPage: 1,
        offset: 0 
      }),
      
      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters },
        currentPage: 1,
        offset: 0
      })),
      
      clearFilters: () => set({
        filters: {
          parish: null,
          industry_id: null,
          vertical_id: null,
          min_price: null,
          max_price: null,
          verification_status: null,
          rating_min: null,
        },
        currentPage: 1,
        offset: 0
      }),
      
      setSearchResults: (results, total, append = false) => set((state) => ({
        searchResults: append ? [...state.searchResults, ...results] : results,
        totalResults: total,
        hasMoreResults: (state.offset + state.resultsPerPage) < total,
        isSearching: false,
        searchError: null
      })),
      
      setSearching: (isSearching) => set({ isSearching }),
      
      setSearchError: (error) => set({ 
        searchError: error,
        isSearching: false 
      }),
      
      // Pagination Actions
      nextPage: () => set((state) => ({
        currentPage: state.currentPage + 1,
        offset: state.currentPage * state.resultsPerPage
      })),
      
      prevPage: () => set((state) => ({
        currentPage: Math.max(1, state.currentPage - 1),
        offset: Math.max(0, (state.currentPage - 2) * state.resultsPerPage)
      })),
      
      setPage: (page) => set({
        currentPage: page,
        offset: (page - 1) * get().resultsPerPage
      }),
      
      // Recent Searches (max 5)
      addRecentSearch: (query) => set((state) => {
        if (!query || query.trim().length === 0) return state;
        
        const trimmedQuery = query.trim();
        const filtered = state.recentSearches.filter(
          search => search.toLowerCase() !== trimmedQuery.toLowerCase()
        );
        
        return {
          recentSearches: [trimmedQuery, ...filtered].slice(0, 5)
        };
      }),
      
      clearRecentSearches: () => set({ recentSearches: [] }),
      
      // Suggestions
      setSuggestions: (suggestions) => set({ 
        suggestions,
        isFetchingSuggestions: false 
      }),
      
      setFetchingSuggestions: (isFetching) => set({ 
        isFetchingSuggestions: isFetching 
      }),
      
      clearSuggestions: () => set({ suggestions: [] }),
      
      // Address Functions (ADDED - for AddressConfirmation component)
      setConfirmedAddress: (addressData) => {
        console.log('🏠 Storing confirmed address:', addressData);
        set({ confirmedAddress: addressData });
      },
      
      getConfirmedAddress: () => {
        const state = get();
        return state.confirmedAddress;
      },
      
      clearConfirmedAddress: () => set({ confirmedAddress: null }),
      
      // Search API Integration
      performSearch: async (query, options = {}) => {
        const state = get();
        const {
          type = state.searchType,
          filters = state.filters,
          page = 1,
          append = false
        } = options;
        
        if (!query || query.trim().length === 0) {
          set({ searchResults: [], totalResults: 0, searchError: null });
          return;
        }
        
        set({ 
          isSearching: true, 
          searchError: null,
          searchQuery: query.trim()
        });
        
        try {
          // Build API URL
          const apiUrl = new URL('/api/search', window.location.origin);
          apiUrl.searchParams.set('q', query.trim());
          apiUrl.searchParams.set('type', type);
          apiUrl.searchParams.set('limit', state.resultsPerPage.toString());
          apiUrl.searchParams.set('offset', ((page - 1) * state.resultsPerPage).toString());
          
          // Add filters
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              apiUrl.searchParams.set(key, value.toString());
            }
          });
          
          const response = await fetch(apiUrl.toString());
          
          if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Update results
          get().setSearchResults(data.results || [], data.total || 0, append);
          
          // Add to recent searches
          get().addRecentSearch(query.trim());
          
          // Update pagination
          set({
            currentPage: page,
            offset: (page - 1) * state.resultsPerPage
          });
          
          return data;
          
        } catch (error) {
          console.error('Search error:', error);
          get().setSearchError(error.message || 'Search failed');
          throw error;
        }
      },
      
      // Load more results (pagination)
      loadMoreResults: async () => {
        const state = get();
        if (!state.hasMoreResults || state.isSearching) return;
        
        return get().performSearch(state.searchQuery, {
          page: state.currentPage + 1,
          append: true
        });
      },
      
      // Fetch suggestions
      fetchSuggestions: async (query) => {
        if (!query || query.trim().length < 2) {
          set({ suggestions: [] });
          return;
        }
        
        set({ isFetchingSuggestions: true });
        
        try {
          const apiUrl = new URL('/api/search/suggestions', window.location.origin);
          apiUrl.searchParams.set('q', query.trim());
          apiUrl.searchParams.set('limit', '10');
          
          const response = await fetch(apiUrl.toString());
          
          if (response.ok) {
            const data = await response.json();
            set({ 
              suggestions: data.suggestions || [],
              isFetchingSuggestions: false 
            });
          } else {
            throw new Error('Failed to fetch suggestions');
          }
        } catch (error) {
          console.error('Suggestions error:', error);
          set({ 
            suggestions: [],
            isFetchingSuggestions: false 
          });
        }
      },
      
      // Reset search state
      resetSearch: () => set({
        searchQuery: '',
        searchResults: [],
        searchType: 'all',
        isSearching: false,
        searchError: null,
        totalResults: 0,
        hasMoreResults: false,
        currentPage: 1,
        offset: 0,
        suggestions: []
      }),
      
      // Get search URL with current state
      getSearchUrl: () => {
        const state = get();
        const url = new URL('/customer/workspace', window.location.origin);
        
        if (state.searchQuery) {
          url.searchParams.set('q', state.searchQuery);
        }
        if (state.searchType !== 'all') {
          url.searchParams.set('type', state.searchType);
        }
        
        // Add active filters
        Object.entries(state.filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            url.searchParams.set(key, value.toString());
          }
        });
        
        return url.toString();
      }
    }),
    {
      name: 'search-store',
      // Only persist certain fields (UPDATED to include confirmedAddress)
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        filters: state.filters,
        searchType: state.searchType,
        confirmedAddress: state.confirmedAddress
      })
    }
  )
);

export default useSearchStore;
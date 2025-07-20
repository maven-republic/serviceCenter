// ============================================================================
// FIXED: src/primitives/customer/useCollectionData.js
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import listingStore from "@/store/listingStore";
import priceStore from "@/store/priceStore";
import useSearchStore from "@/store/searchStore";

export function useCollectionData() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q');
  const urlType = searchParams.get('type');
  const urlCategory = searchParams.get('category');
  
  // Store state
  const getDeliveryTime = listingStore((state) => state.getDeliveryTime);
  const getPriceRange = priceStore((state) => state.priceRange);
  const getLevel = listingStore((state) => state.getLevel);
  const getLocation = listingStore((state) => state.getLocation);
  const getBestSeller = listingStore((state) => state.getBestSeller);
  const getDesginTool = listingStore((state) => state.getDesginTool);
  const getSpeak = listingStore((state) => state.getSpeak);
  const getSearch = listingStore((state) => state.getSearch);
  const resetAllFilters = listingStore((state) => state.resetAllFilters);
  const getCategory = listingStore((state) => state.getCategory);
  
  const { searchQuery, setSearchQuery } = useSearchStore();

  // 🔧 FIX: Clear services immediately when search is cleared
  useEffect(() => {
    const hasSearchQuery = urlQuery || searchQuery || getSearch;
    
    if (!hasSearchQuery) {
      // Clear search results immediately when all search queries are empty
      console.log('🧹 Clearing search results - no active search');
      setServices([]);
      setTotalResults(0);
      setCurrentPage(1); // Reset to first page
    }
  }, [urlQuery, searchQuery, getSearch]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const isSearchQuery = urlQuery || searchQuery || getSearch;
      let apiUrl;
      let requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      };

      if (isSearchQuery) {
        apiUrl = new URL('/api/search', window.location.origin);
        apiUrl.searchParams.set('q', isSearchQuery);
        apiUrl.searchParams.set('type', urlType || 'all');
        apiUrl.searchParams.set('limit', itemsPerPage.toString());
        apiUrl.searchParams.set('offset', ((currentPage - 1) * itemsPerPage).toString());
        
        if (urlCategory) apiUrl.searchParams.set('category', urlCategory);
        if (getPriceRange.min > 0) apiUrl.searchParams.set('min_price', getPriceRange.min.toString());
        if (getPriceRange.max < 100000) apiUrl.searchParams.set('max_price', getPriceRange.max.toString());
      } else {
        apiUrl = new URL('/api/services', window.location.origin);
        apiUrl.searchParams.set('limit', itemsPerPage.toString());
        apiUrl.searchParams.set('offset', ((currentPage - 1) * itemsPerPage).toString());
      }

      const response = await fetch(apiUrl.toString(), requestOptions);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      let serviceResults = [];
      let totalCount = 0;

      if (isSearchQuery) {
        if (data.results && Array.isArray(data.results)) {
          serviceResults = data.results.filter(result => result.type === 'service');
          totalCount = data.total || serviceResults.length;
        }
      } else {
        if (Array.isArray(data)) {
          serviceResults = data;
          totalCount = data.length;
        } else if (data.services && Array.isArray(data.services)) {
          serviceResults = data.services;
          totalCount = data.total || data.services.length;
        } else if (data.data && Array.isArray(data.data)) {
          serviceResults = data.data;
          totalCount = data.total || data.data.length;
        }
      }

      setServices(serviceResults);
      setTotalResults(totalCount);

      if (urlQuery && urlQuery !== searchQuery) {
        setSearchQuery(urlQuery);
      }

    } catch (error) {
      console.error('❌ API Error:', error);
      setError(error.message);
      await loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = async () => {
    try {
      const productData = await import("@/data/product");
      
      if (productData.service && Array.isArray(productData.service)) {
        setServices(productData.service);
        setTotalResults(productData.service.length);
        setError(null);
      } else if (productData.default?.service && Array.isArray(productData.default.service)) {
        setServices(productData.default.service);
        setTotalResults(productData.default.service.length);
        setError(null);
      } else {
        setServices([]);
        setTotalResults(0);
      }
    } catch (fallbackError) {
      console.error('❌ Fallback data failed:', fallbackError);
      setServices([]);
      setTotalResults(0);
      setError('Unable to load services data');
    }
  };

  // 🔧 FIX: Only fetch when there's actually a search query or we need to load default services
  useEffect(() => {
    const hasSearchQuery = urlQuery || searchQuery || getSearch;
    
    if (hasSearchQuery) {
      // Fetch search results
      fetchServices();
    } else {
      // Load default services (all services)
      fetchServices();
    }
  }, [
    urlQuery, urlType, urlCategory, searchQuery, getSearch, 
    currentPage, itemsPerPage, getPriceRange.min, getPriceRange.max, setSearchQuery
  ]);

  useEffect(() => {
    resetAllFilters();
  }, [resetAllFilters]);

  return {
    // State
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    loading,
    services,
    error,
    totalResults,
    
    // URL params
    urlQuery,
    urlType,
    urlCategory,
    
    // Store getters
    getDeliveryTime,
    getPriceRange,
    getLevel,
    getLocation,
    getBestSeller,
    getDesginTool,
    getSpeak,
    getSearch,
    getCategory,
    resetAllFilters,
    
    // Search
    searchQuery,
    
    // Functions
    fetchServices,
    retryFetch: fetchServices
  };
}
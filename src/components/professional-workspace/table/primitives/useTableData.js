// src/components/professional-workspace/table/primitives/useTableData.js

import { useState, useCallback, useMemo, useRef } from 'react'

/**
 * Hook for managing table data operations
 * Supports search, pagination, and data transformations
 */
export function useTableData({
  data = [],
  mode = 'available',
  pageSize = 10,
  searchableFields = ['customer', 'service', 'description'],
  onDataChange,
  enableVirtualization = false,
  cacheData = true
} = {}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Cache for expensive operations
  const cacheRef = useRef(new Map())

  // Generate cache key
  const getCacheKey = useCallback((operation, params) => {
    return `${operation}-${JSON.stringify(params)}`
  }, [])

  // Get searchable text from item
  const getSearchableText = useCallback((item) => {
    const appointment = mode === 'interests' ? item.appointment : item
    const customer = appointment?.customer?.account
    
    const searchableValues = [
      // Customer information
      customer?.first_name,
      customer?.last_name,
      customer?.email,
      
      // Service information
      appointment?.service?.name,
      appointment?.title,
      appointment?.description,
      appointment?.customer_message,
      
      // Status and metadata
      appointment?.status,
      item.status, // For interests mode
      appointment?.urgency,
      appointment?.priority,
      
      // Additional searchable fields
      appointment?.location,
      appointment?.address,
      appointment?.notes
    ].filter(Boolean)
    
    return searchableValues.join(' ').toLowerCase()
  }, [mode])

  // Search functionality
  const searchData = useMemo(() => {
    if (!searchQuery.trim()) return data
    
    const cacheKey = getCacheKey('search', { query: searchQuery, dataLength: data.length })
    
    if (cacheData && cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey)
    }
    
    const query = searchQuery.toLowerCase().trim()
    const results = data.filter(item => {
      const searchableText = getSearchableText(item)
      return searchableText.includes(query)
    })
    
    if (cacheData) {
      cacheRef.current.set(cacheKey, results)
    }
    
    return results
  }, [data, searchQuery, getSearchableText, getCacheKey, cacheData])

  // For backward compatibility, filteredData is the same as searchData
  const filteredData = searchData

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  // Pagination info
  const paginationInfo = useMemo(() => {
    const totalItems = filteredData.length
    const totalPages = Math.ceil(totalItems / pageSize)
    
    return {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      startIndex: Math.min(((currentPage - 1) * pageSize) + 1, totalItems),
      endIndex: Math.min(currentPage * pageSize, totalItems)
    }
  }, [filteredData.length, currentPage, pageSize])

  // Search handlers
  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page
    onDataChange?.({ type: 'search', query, resultCount: filteredData.length })
  }, [onDataChange, filteredData.length])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setCurrentPage(1)
  }, [])

  // For backward compatibility - these now do nothing but are kept for existing code
  const handleFilter = useCallback((field, value) => {
    console.warn('Filters have been removed. Use search instead.')
  }, [])

  const clearFilter = useCallback((field) => {
    console.warn('Filters have been removed. Use search instead.')
  }, [])

  const clearAllFilters = useCallback(() => {
    clearSearch()
  }, [clearSearch])

  // Pagination handlers
  const goToPage = useCallback((page) => {
    const maxPage = Math.ceil(filteredData.length / pageSize)
    const validPage = Math.max(1, Math.min(page, maxPage))
    setCurrentPage(validPage)
  }, [filteredData.length, pageSize])

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  const setPageSize = useCallback((newPageSize) => {
    setCurrentPage(1)
    // Note: pageSize is passed as prop, so this is just for compatibility
  }, [])

  // Data statistics
  const dataStats = useMemo(() => {
    const total = data.length
    const filtered = filteredData.length
    const visible = paginatedData.length
    
    // Calculate status distribution
    const statusDistribution = data.reduce((acc, item) => {
      const status = mode === 'interests' ? item.status : (item.appointment?.status || item.status)
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
    
    // Calculate urgency distribution
    const urgencyDistribution = data.reduce((acc, item) => {
      const appointment = mode === 'interests' ? item.appointment : item
      const urgency = appointment?.urgency || 'standard'
      acc[urgency] = (acc[urgency] || 0) + 1
      return acc
    }, {})
    
    return {
      total,
      filtered,
      visible,
      filterEfficiency: total > 0 ? Math.round((filtered / total) * 100) : 0,
      statusDistribution,
      urgencyDistribution,
      hasActiveFilters: searchQuery.length > 0 // Only search now
    }
  }, [data, filteredData, paginatedData, searchQuery, mode])

  // Clear cache when data changes
  useMemo(() => {
    if (cacheData) {
      cacheRef.current.clear()
    }
  }, [data, cacheData])

  return {
    // Processed data
    processedData: paginatedData,
    filteredData,
    searchData,
    
    // State
    searchQuery,
    filters: {}, // Empty object for backward compatibility
    loading,
    
    // Pagination
    paginationInfo,
    
    // Actions
    handleSearch,
    clearSearch,
    handleFilter, // Deprecated but kept for compatibility
    clearFilter, // Deprecated but kept for compatibility
    clearAllFilters: clearSearch, // Now just clears search
    goToPage,
    nextPage,
    previousPage,
    setLoading,
    setPageSize,
    
    // Statistics
    dataStats,
    
    // Utilities
    getSearchableText
  }
}
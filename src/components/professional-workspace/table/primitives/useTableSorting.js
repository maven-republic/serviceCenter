
// src/components/professional-workspace/table/primitives/useTableSorting.js

import { useState, useCallback, useMemo } from 'react'

/**
 * Hook for managing table sorting state and logic
 * Supports multi-column sorting, custom sort functions, and data processing
 */
export function useTableSorting({
  data = [],
  columns = [],
  defaultSort = { key: 'created_at', direction: 'desc' },
  mode = 'available',
  multiSort = false, // Enable multi-column sorting
  onSortChange,
  customSortFunctions = {} // Custom sort functions for specific columns
} = {}) {
  const [internalSortConfig, setInternalSortConfig] = useState(
    multiSort ? [defaultSort] : defaultSort
  )
  
  // Use external sort config if provided
  const sortConfig = onSortChange ? 
    (multiSort ? [defaultSort] : defaultSort) : 
    internalSortConfig

  // Update sort configuration
  const updateSortConfig = useCallback((newConfig) => {
    if (onSortChange) {
      onSortChange(newConfig)
    } else {
      setInternalSortConfig(newConfig)
    }
  }, [onSortChange])

  // Handle sort for single column
  const handleSort = useCallback((columnKey) => {
    const column = columns.find(col => col.key === columnKey)
    if (!column || column.sortable === false) return

    if (multiSort) {
      // Multi-column sorting
      const newSortConfig = [...(Array.isArray(sortConfig) ? sortConfig : [sortConfig])]
      const existingIndex = newSortConfig.findIndex(sort => sort.key === columnKey)
      
      if (existingIndex >= 0) {
        // Update existing sort
        const existingSort = newSortConfig[existingIndex]
        if (existingSort.direction === 'asc') {
          newSortConfig[existingIndex] = { key: columnKey, direction: 'desc' }
        } else {
          // Remove from sort
          newSortConfig.splice(existingIndex, 1)
        }
      } else {
        // Add new sort
        newSortConfig.push({ key: columnKey, direction: 'asc' })
      }
      
      updateSortConfig(newSortConfig)
    } else {
      // Single column sorting
      const currentSort = sortConfig
      const newDirection = 
        currentSort.key === columnKey && currentSort.direction === 'asc' 
          ? 'desc' 
          : 'asc'
      
      updateSortConfig({ key: columnKey, direction: newDirection })
    }
  }, [columns, sortConfig, multiSort, updateSortConfig])

  // Get sort icon for column
  const getSortIcon = useCallback((columnKey) => {
    if (multiSort) {
      const sortArray = Array.isArray(sortConfig) ? sortConfig : [sortConfig]
      const sort = sortArray.find(s => s.key === columnKey)
      if (!sort) return { icon: 'none', priority: null }
      
      return {
        icon: sort.direction === 'asc' ? 'asc' : 'desc',
        priority: sortArray.indexOf(sort) + 1
      }
    } else {
      if (sortConfig.key !== columnKey) return { icon: 'none' }
      return { icon: sortConfig.direction === 'asc' ? 'asc' : 'desc' }
    }
  }, [sortConfig, multiSort])

  // Custom sort function for complex data structures
  const getSortValue = useCallback((item, columnKey) => {
    const column = columns.find(col => col.key === columnKey)
    
    // Use custom sort function if provided
    if (customSortFunctions[columnKey]) {
      return customSortFunctions[columnKey](item, mode)
    }
    
    // Use column accessor function
    if (column?.accessorFn) {
      return column.accessorFn(item, mode)
    }
    
    // Handle mode-specific data structure
    const dataSource = mode === 'interests' ? item.appointment : item
    let value = dataSource?.[columnKey]
    
    // Handle special cases
    switch (columnKey) {
      case 'customer':
        const customer = dataSource?.customer?.account
        return `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim()
      
      case 'service':
        return dataSource?.service?.name || dataSource?.title || ''
      
      case 'status':
        return mode === 'interests' ? item.status : dataSource?.status
      
      case 'time':
      case 'appointment_time':
        return dataSource?.session ||
               dataSource?.appointment_time || 
               dataSource?.scheduled_time || 
               dataSource?.start_time || 
               dataSource?.datetime || 
               dataSource?.date || 
               dataSource?.time ||
               dataSource?.created_at ||
               null
      
      case 'urgency':
      case 'priority':
        return dataSource?.urgency || dataSource?.priority || 'standard'
      
      default:
        return value
    }
  }, [columns, customSortFunctions, mode])

  // Sort the data
  const sortedData = useMemo(() => {
    if (!data.length) return data
    
    const sortArray = multiSort 
      ? (Array.isArray(sortConfig) ? sortConfig : [sortConfig])
      : [sortConfig]
    
    // Filter out invalid sorts
    const validSorts = sortArray.filter(sort => 
      sort.key && columns.find(col => col.key === sort.key && col.sortable !== false)
    )
    
    if (!validSorts.length) return data

    return [...data].sort((a, b) => {
      for (const sort of validSorts) {
        let aValue = getSortValue(a, sort.key)
        let bValue = getSortValue(b, sort.key)
        
        // Handle null/undefined values
        if (aValue == null && bValue == null) continue
        if (aValue == null) return 1
        if (bValue == null) return -1
        
        // Handle dates
        if (sort.key.includes('_at') || sort.key === 'time' || sort.key === 'date') {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        }
        
        // Handle strings (case insensitive)
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }
        
        // Compare values
        let comparison = 0
        if (aValue < bValue) comparison = -1
        else if (aValue > bValue) comparison = 1
        
        if (comparison !== 0) {
          return sort.direction === 'asc' ? comparison : -comparison
        }
      }
      return 0
    })
  }, [data, sortConfig, getSortValue, columns, multiSort])

  // Sort state helpers
  const sortState = useMemo(() => {
    const sortArray = multiSort 
      ? (Array.isArray(sortConfig) ? sortConfig : [sortConfig])
      : [sortConfig]
    
    return {
      activeSorts: sortArray.filter(sort => sort.key),
      sortCount: sortArray.length,
      hasSorting: sortArray.some(sort => sort.key),
      primarySort: sortArray[0] || null
    }
  }, [sortConfig, multiSort])

  // Clear all sorting
  const clearSort = useCallback(() => {
    updateSortConfig(multiSort ? [] : { key: null, direction: 'asc' })
  }, [multiSort, updateSortConfig])

  // Apply default sorting
  const resetSort = useCallback(() => {
    updateSortConfig(multiSort ? [defaultSort] : defaultSort)
  }, [multiSort, defaultSort, updateSortConfig])

  return {
    // Core sorting state
    sortConfig,
    sortedData,
    sortState,
    
    // Sorting actions
    handleSort,
    clearSort,
    resetSort,
    
    // Utilities
    getSortIcon,
    getSortValue
  }
}

// src/components/professional-workspace/table/primitives/useTableSelection.js

import { useState, useCallback, useMemo, useEffect } from 'react'

/**
 * Hook for managing table row selection state
 * Supports single/multi selection, bulk operations, and persistence
 */
export function useTableSelection({
  data = [],
  getItemId = (item) => item.id || item.appointment_id,
  mode = 'available',
  initialSelection = new Set(),
  onSelectionChange,
  maxSelection = null, // Optional limit on number of selected items
  persistSelection = false, // Whether to persist selection across data changes
  disabled = false
} = {}) {
  const [internalSelection, setInternalSelection] = useState(initialSelection)
  
  // Use external selection if provided, otherwise use internal
  const selection = onSelectionChange ? initialSelection : internalSelection
  
  // Get all selectable item IDs
  const selectableIds = useMemo(() => {
    return data.map(item => {
      if (mode === 'interests') {
        return item.appointment?.appointment_id || getItemId(item)
      }
      return getItemId(item)
    }).filter(id => id != null)
  }, [data, mode, getItemId])

  // Clear selection when data changes (unless persistence is enabled)
  useEffect(() => {
    if (!persistSelection && data.length > 0) {
      const validSelection = new Set([...selection].filter(id => selectableIds.includes(id)))
      if (validSelection.size !== selection.size) {
        updateSelection(validSelection)
      }
    }
  }, [data, persistSelection, selectableIds])

  // Update selection helper
  const updateSelection = useCallback((newSelection) => {
    if (disabled) return
    
    if (onSelectionChange) {
      onSelectionChange(newSelection)
    } else {
      setInternalSelection(newSelection)
    }
  }, [onSelectionChange, disabled])

  // Toggle individual item selection
  const toggleSelection = useCallback((itemId) => {
    if (disabled || !itemId) return
    
    const newSelection = new Set(selection)
    
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId)
    } else {
      // Check max selection limit
      if (maxSelection && newSelection.size >= maxSelection) {
        console.warn(`Selection limit reached: ${maxSelection}`)
        return
      }
      newSelection.add(itemId)
    }
    
    updateSelection(newSelection)
  }, [selection, updateSelection, disabled, maxSelection])

  // Select/deselect all items
  const toggleSelectAll = useCallback(() => {
    if (disabled) return
    
    if (selection.size === selectableIds.length && selectableIds.length > 0) {
      // Deselect all
      updateSelection(new Set())
    } else {
      // Select all (or up to limit)
      const newSelection = new Set()
      const itemsToSelect = maxSelection ? selectableIds.slice(0, maxSelection) : selectableIds
      itemsToSelect.forEach(id => newSelection.add(id))
      updateSelection(newSelection)
    }
  }, [selection.size, selectableIds, updateSelection, disabled, maxSelection])

  // Select specific items
  const selectItems = useCallback((itemIds) => {
    if (disabled) return
    
    const validIds = itemIds.filter(id => selectableIds.includes(id))
    const limitedIds = maxSelection ? validIds.slice(0, maxSelection) : validIds
    updateSelection(new Set(limitedIds))
  }, [selectableIds, updateSelection, disabled, maxSelection])

  // Clear selection
  const clearSelection = useCallback(() => {
    if (disabled) return
    updateSelection(new Set())
  }, [updateSelection, disabled])

  // Get selected items (full objects)
  const selectedItems = useMemo(() => {
    return data.filter(item => {
      const itemId = mode === 'interests' 
        ? item.appointment?.appointment_id || getItemId(item)
        : getItemId(item)
      return selection.has(itemId)
    })
  }, [data, selection, mode, getItemId])

  // Selection state helpers
  const selectionState = useMemo(() => {
    const totalCount = selectableIds.length
    const selectedCount = selection.size
    
    return {
      selectedCount,
      totalCount,
      hasSelection: selectedCount > 0,
      isAllSelected: selectedCount === totalCount && totalCount > 0,
      isPartiallySelected: selectedCount > 0 && selectedCount < totalCount,
      canSelectMore: !maxSelection || selectedCount < maxSelection,
      selectionPercentage: totalCount > 0 ? Math.round((selectedCount / totalCount) * 100) : 0
    }
  }, [selection.size, selectableIds.length, maxSelection])

  // Check if specific item is selected
  const isSelected = useCallback((itemId) => {
    return selection.has(itemId)
  }, [selection])

  // Bulk operation helpers
  const bulkOperations = useMemo(() => ({
    // Get IDs for bulk operations
    getSelectedIds: () => Array.from(selection),
    
    // Apply operation to selected items
    applyToSelected: (operation) => {
      return selectedItems.map(operation)
    },
    
    // Filter selected items
    filterSelected: (predicate) => {
      return selectedItems.filter(predicate)
    },
    
    // Group selected items
    groupSelected: (groupFn) => {
      return selectedItems.reduce((groups, item) => {
        const key = groupFn(item)
        if (!groups[key]) groups[key] = []
        groups[key].push(item)
        return groups
      }, {})
    }
  }), [selection, selectedItems])

  return {
    // Core selection state
    selection,
    selectedItems,
    selectionState,
    
    // Selection actions
    toggleSelection,
    toggleSelectAll,
    selectItems,
    clearSelection,
    isSelected,
    
    // Bulk operations
    bulkOperations,
    
    // Utilities
    selectableIds,
    disabled
  }
}


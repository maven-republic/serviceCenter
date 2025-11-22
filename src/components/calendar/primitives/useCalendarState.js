// src/components/calendar/hooks/useCalendarState.js
import { useState, useCallback } from 'react'

/**
 * Manages calendar UI state (dates, selections, mode)
 * 
 * Handles:
 * - Current date navigation
 * - Day/week view mode
 * - Selected date tracking
 * - Professional-specific selections (for targeted mode)
 * 
 * @param {string} initialMode - 'day' or 'week'
 * @returns {Object} Calendar state and methods
 */
export function useCalendarState(initialMode = 'day') {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [viewMode, setViewMode] = useState(initialMode)
  const [professionalSelections, setProfessionalSelections] = useState({})

  // Navigate to previous period
  const goToPrevious = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (viewMode === 'week') {
        newDate.setDate(prev.getDate() - 7)
      } else {
        newDate.setMonth(prev.getMonth() - 1)
      }
      return newDate
    })
  }, [viewMode])

  // Navigate to next period
  const goToNext = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (viewMode === 'week') {
        newDate.setDate(prev.getDate() + 7)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }, [viewMode])

  // Go to today
  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  // Handle date selection
  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date)
  }, [])

  // Handle professional slot selection (for targeted mode)
  const handleProfessionalSlotSelect = useCallback((professionalId, slotData) => {
    setProfessionalSelections(prev => ({
      ...prev,
      [professionalId]: slotData
    }))
  }, [])

  // Clear professional selection
  const clearProfessionalSelection = useCallback((professionalId) => {
    setProfessionalSelections(prev => {
      const updated = { ...prev }
      delete updated[professionalId]
      return updated
    })
  }, [])

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    setSelectedDate(null)
    setProfessionalSelections({})
  }, [])

  // Toggle view mode
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'day' ? 'week' : 'day')
  }, [])

  return {
    // State
    currentDate,
    selectedDate,
    viewMode,
    professionalSelections,
    
    // Methods
    setCurrentDate,
    setSelectedDate,
    setViewMode,
    goToPrevious,
    goToNext,
    goToToday,
    handleDateSelect,
    handleProfessionalSlotSelect,
    clearProfessionalSelection,
    clearAllSelections,
    toggleViewMode,
    
    // Computed
    hasSelections: selectedDate !== null || Object.keys(professionalSelections).length > 0,
    selectionCount: Object.keys(professionalSelections).length
  }
}
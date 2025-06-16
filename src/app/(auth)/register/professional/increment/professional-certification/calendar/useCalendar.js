import { useState, useCallback } from 'react'

export function useCalendar(selectedDate) {
  // Initialize current date based on selected date or today
  const getInitialDate = () => {
    if (selectedDate) {
      return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    }
    return new Date()
  }

  const [currentDate, setCurrentDate] = useState(getInitialDate)

  // Format date for input value (ISO format)
  const formatDate = useCallback((date) => {
    if (!date) return ''
    return date.toISOString().split('T')[0]
  }, [])

  // Format date for display in input field
  const formatDisplayDate = useCallback((date) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }, [])

  // Navigate to a specific month/year
  const navigateToDate = useCallback((year, month) => {
    setCurrentDate(new Date(year, month, 1))
  }, [])

  // Navigate relative to current date
  const navigateMonths = useCallback((months) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + months)
      return newDate
    })
  }, [])

  const navigateYears = useCallback((years) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setFullYear(prev.getFullYear() + years)
      return newDate
    })
  }, [])

  // Get current month and year for display
  const getCurrentMonth = useCallback(() => {
    return currentDate.getMonth()
  }, [currentDate])

  const getCurrentYear = useCallback(() => {
    return currentDate.getFullYear()
  }, [currentDate])

  // Check if a date is in the currently displayed month
  const isInCurrentMonth = useCallback((date) => {
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear()
  }, [currentDate])

  // Reset to today
  const resetToToday = useCallback(() => {
    const today = new Date()
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
  }, [])

  // Go to the month containing the selected date
  const goToSelectedDate = useCallback((date) => {
    if (date) {
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1))
    }
  }, [])

  return {
    currentDate,
    setCurrentDate,
    formatDate,
    formatDisplayDate,
    navigateToDate,
    navigateMonths,
    navigateYears,
    getCurrentMonth,
    getCurrentYear,
    isInCurrentMonth,
    resetToToday,
    goToSelectedDate
  }
}
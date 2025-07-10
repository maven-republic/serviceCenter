import { useState, useCallback, useEffect } from 'react'

export function useCalendar(selectedDate) {
  // Initialize current date based on selected date or today
  const getInitialDate = () => {
    if (selectedDate) {
      return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    }
    return new Date()
  }

  const [currentDate, setCurrentDate] = useState(getInitialDate)

  // Update current date when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      setCurrentDate(newDate)
    }
  }, [selectedDate])

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

  // Format date for display in long format
  const formatDisplayDateLong = useCallback((date) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  // Check if date is today
  const isToday = useCallback((date) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }, [])

  // Check if date is selected
  const isDateSelected = useCallback((date) => {
    if (!date || !selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }, [selectedDate])

  // Get today's date
  const getToday = useCallback(() => {
    return new Date()
  }, [])

  // Validate if date is valid
  const isValidDate = useCallback((date) => {
    return date instanceof Date && !isNaN(date.getTime())
  }, [])

  return {
    currentDate,
    setCurrentDate,
    formatDate,
    formatDisplayDate,
    formatDisplayDateLong,
    navigateToDate,
    navigateMonths,
    navigateYears,
    getCurrentMonth,
    getCurrentYear,
    isInCurrentMonth,
    resetToToday,
    goToSelectedDate,
    isToday,
    isDateSelected,
    getToday,
    isValidDate
  }
}
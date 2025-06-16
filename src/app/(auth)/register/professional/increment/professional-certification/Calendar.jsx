'use client'

import { useState, useEffect, useRef } from 'react'
import CalendarInput from './calendar/CalendarInput'
import CalendarDropdown from './calendar/CalendarDropdown'
import { useCalendar } from './calendar/useCalendar'

export default function Calendar({ value, onChange, placeholder = "Select date" }) {
  // State management
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null)
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Refs
  const calendarRef = useRef(null)
  
  // Custom hook for calendar logic
  const {
    currentDate,
    setCurrentDate,
    formatDate,
    formatDisplayDate
  } = useCalendar(selectedDate)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Sync selected date with prop value
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      setSelectedDate(date)
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1))
    }
  }, [value, setCurrentDate])

  // Outside click handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false)
        setShowMonthDropdown(false)
        setShowYearDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Event handlers
  const handleInputClick = () => {
    setIsOpen(!isOpen)
  }

  const handleDateSelect = (dayObj) => {
    const selectedDate = dayObj.date
    
    if (!dayObj.isCurrentMonth) {
      setCurrentDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
    }
    
    setSelectedDate(selectedDate)
    onChange(formatDate(selectedDate))
    setIsOpen(false)
  }

  const handleTodayClick = () => {
    const today = new Date()
    setCurrentDate(today)
    handleDateSelect({ date: today, isCurrentMonth: true })
  }

  const handleClearClick = () => {
    setSelectedDate(null)
    onChange('')
    setIsOpen(false)
  }

  const handleMonthChange = (monthIndex) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), monthIndex, 1))
    setShowMonthDropdown(false)
  }

  const handleYearChange = (year) => {
    setCurrentDate(prev => new Date(year, prev.getMonth(), 1))
    setShowYearDropdown(false)
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const navigateYear = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setFullYear(prev.getFullYear() + direction)
      return newDate
    })
  }

  // Dropdown state handlers
  const toggleMonthDropdown = () => {
    setShowMonthDropdown(!showMonthDropdown)
    setShowYearDropdown(false)
  }

  const toggleYearDropdown = () => {
    setShowYearDropdown(!showYearDropdown)
    setShowMonthDropdown(false)
  }

  // Calendar props to pass to sub-components
  const calendarProps = {
    selectedDate,
    currentDate,
    isMobile,
    isOpen,
    showMonthDropdown,
    showYearDropdown,
    onDateSelect: handleDateSelect,
    onTodayClick: handleTodayClick,
    onClearClick: handleClearClick,
    onMonthChange: handleMonthChange,
    onYearChange: handleYearChange,
    onNavigateMonth: navigateMonth,
    onNavigateYear: navigateYear,
    onToggleMonthDropdown: toggleMonthDropdown,
    onToggleYearDropdown: toggleYearDropdown
  }

  return (
    <div className="position-relative" ref={calendarRef}>
      <CalendarInput
        selectedDate={selectedDate}
        placeholder={placeholder}
        isMobile={isMobile}
        onClick={handleInputClick}
        formatDisplayDate={formatDisplayDate}
      />

      {isOpen && (
        <CalendarDropdown
          {...calendarProps}
        />
      )}
    </div>
  )
}
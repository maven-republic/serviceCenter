'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

// Custom hook for calendar logic
const useCalendar = (selectedDate) => {
  const [currentDate, setCurrentDate] = useState(() => {
    if (selectedDate) {
      return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  })

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return {
    currentDate,
    setCurrentDate,
    formatDate,
    formatDisplayDate
  }
}

// Calendar input component
const CalendarInput = ({ selectedDate, placeholder, onClick, formatDisplayDate }) => {
  return (
    <div className="relative">
      <Input
        type="text"
        readOnly
        value={selectedDate ? formatDisplayDate(selectedDate) : ''}
        placeholder={placeholder}
        onClick={onClick}
        className="cursor-pointer pr-10"
      />
      <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
  )
}

// Main Calendar component
export default function Calendar({ value, onChange, placeholder = "Select date" }) {
  // State management
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null)
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  
  // Refs
  const calendarRef = useRef(null)
  
  // Custom hook for calendar logic
  const {
    currentDate,
    setCurrentDate,
    formatDate,
    formatDisplayDate
  } = useCalendar(selectedDate)

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

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()
    
    const days = []
    
    // Previous month days
    const prevMonth = new Date(year, month - 1, 0)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i
      days.push({
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        isToday: false
      })
    }
    
    // Current month days
    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString()
      })
    }
    
    // Next month days
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isToday: false
      })
    }
    
    return days
  }

  // Event handlers
  const handleInputClick = () => {
    setIsOpen(!isOpen)
  }

  const handleDateSelect = (dayObj) => {
    const date = dayObj.date
    
    if (!dayObj.isCurrentMonth) {
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1))
    }
    
    setSelectedDate(date)
    onChange(formatDate(date))
    setIsOpen(false)
  }

  const handleTodayClick = () => {
    const today = new Date()
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
    handleDateSelect({ date: today, isCurrentMonth: true })
  }

  const handleClearClick = () => {
    setSelectedDate(null)
    onChange('')
    setIsOpen(false)
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

  // Generate months and years for dropdowns
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i)

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const calendarDays = generateCalendarDays()

  return (
    <div className="relative" ref={calendarRef}>
      <CalendarInput
        selectedDate={selectedDate}
        placeholder={placeholder}
        onClick={handleInputClick}
        formatDisplayDate={formatDisplayDate}
      />

      {isOpen && (
        <Card className="absolute top-full left-0 z-50 mt-1 w-80 shadow-lg animate-in fade-in-0 slide-in-from-top-1">
          <CardHeader className="pb-3">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateYear(-1)}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {/* Month Dropdown */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowMonthDropdown(!showMonthDropdown)
                      setShowYearDropdown(false)
                    }}
                    className="flex items-center gap-1"
                  >
                    {months[currentDate.getMonth()]}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  
                  {showMonthDropdown && (
                    <Card className="absolute top-full left-0 mt-1 z-10 max-h-48 overflow-y-auto">
                      <CardContent className="p-1">
                        {months.map((month, index) => (
                          <Button
                            key={month}
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCurrentDate(prev => new Date(prev.getFullYear(), index, 1))
                              setShowMonthDropdown(false)
                            }}
                            className="w-full justify-start text-sm"
                          >
                            {month}
                          </Button>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Year Dropdown */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowYearDropdown(!showYearDropdown)
                      setShowMonthDropdown(false)
                    }}
                    className="flex items-center gap-1"
                  >
                    {currentDate.getFullYear()}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  
                  {showYearDropdown && (
                    <Card className="absolute top-full left-0 mt-1 z-10 max-h-48 overflow-y-auto">
                      <CardContent className="p-1">
                        {years.map((year) => (
                          <Button
                            key={year}
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCurrentDate(prev => new Date(year, prev.getMonth(), 1))
                              setShowYearDropdown(false)
                            }}
                            className="w-full justify-start text-sm"
                          >
                            {year}
                          </Button>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateYear(1)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(-1)}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(1)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 border-b">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((dayObj, index) => {
                const isSelected = selectedDate && 
                  dayObj.date.toDateString() === selectedDate.toDateString()
                
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDateSelect(dayObj)}
                    className={cn(
                      "h-9 w-full p-0 font-normal",
                      !dayObj.isCurrentMonth && "text-muted-foreground",
                      dayObj.isToday && "bg-accent text-accent-foreground",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    {dayObj.date.getDate()}
                  </Button>
                )
              })}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTodayClick}
              >
                Today
              </Button>
              
              {selectedDate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearClick}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
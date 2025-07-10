'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CustomerAvailabilityCalendar({ 
  professionalId, 
  onSlotSelect, 
  selectedSlot,
  className = ''
}) {
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  // Fetch available slots from API
  const fetchAvailableSlots = useCallback(async (startDate, endDate) => {
    if (!professionalId) {
      console.error('❌ No professionalId provided')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const url = `/api/professionals/${professionalId}/appointment-availability?start_date=${startDate}&end_date=${endDate}&slot_duration=60`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API returned HTML instead of JSON - check server logs')
      }

      const data = await response.json()
      setAvailableSlots(data.available_slots || [])
    } catch (err) {
      console.error('❌ Error fetching availability:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [professionalId])

  // Load slots when component mounts or month changes
  useEffect(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // Get full calendar view range (6 weeks)
    const firstDayOfMonth = new Date(year, month, 1)
    const calendarStart = new Date(firstDayOfMonth)
    calendarStart.setDate(calendarStart.getDate() - firstDayOfMonth.getDay())
    
    const calendarEnd = new Date(calendarStart)
    calendarEnd.setDate(calendarEnd.getDate() + 41) // 6 weeks
    
    const startDateStr = formatDate(calendarStart)
    const endDateStr = formatDate(calendarEnd)
    
    fetchAvailableSlots(startDateStr, endDateStr)
  }, [fetchAvailableSlots, currentMonth])

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped = {}
    availableSlots.forEach(slot => {
      const date = slot.date
      if (!grouped[date]) grouped[date] = []
      grouped[date].push(slot)
    })
    return grouped
  }, [availableSlots])

  // Get available dates
  const availableDates = useMemo(() => {
    return Object.keys(slotsByDate).filter(date => slotsByDate[date].length > 0)
  }, [slotsByDate])

  // Get time slots for selected date
  const timeSlotsForSelectedDate = useMemo(() => {
    return selectedDate ? slotsByDate[selectedDate] || [] : []
  }, [selectedDate, slotsByDate])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(current)
        const dateStr = formatDate(date)
        const isCurrentMonth = date.getMonth() === month
        const isAvailable = availableDates.includes(dateStr)
        const isTodayDate = isToday(date)
        const isPastDate = isPast(date)
        
        days.push({
          date: dateStr,
          dayNumber: date.getDate(),
          isCurrentMonth,
          isAvailable,
          isToday: isTodayDate,
          isPast: isPastDate,
          isSelected: selectedDate === dateStr,
          slotsCount: slotsByDate[dateStr]?.length || 0
        })
        
        current.setDate(current.getDate() + 1)
      }
    }
    
    return days
  }, [currentMonth, availableDates, selectedDate, slotsByDate])

  // Navigation handlers
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    setSelectedDate(null)
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    setSelectedDate(null)
  }, [])

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date())
    setSelectedDate(null)
  }, [])

  // Event handlers
  const handleDateSelect = useCallback((dateStr, isAvailable) => {
    if (isAvailable && !loading) {
      setSelectedDate(selectedDate === dateStr ? null : dateStr)
    }
  }, [selectedDate, loading])

  const handleSlotSelect = useCallback((slot) => {
    onSlotSelect?.(slot.datetime)
  }, [onSlotSelect])

  const handleRetry = useCallback(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDayOfMonth = new Date(year, month, 1)
    const calendarStart = new Date(firstDayOfMonth)
    calendarStart.setDate(calendarStart.getDate() - firstDayOfMonth.getDay())
    const calendarEnd = new Date(calendarStart)
    calendarEnd.setDate(calendarEnd.getDate() + 41)
    fetchAvailableSlots(formatDate(calendarStart), formatDate(calendarEnd))
  }, [currentMonth, fetchAvailableSlots])

  // Format month name
  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  // Error state
  if (error) {
    return (
      <Card className={cn("h-full", className)}>
        <CardContent className="flex flex-col items-center justify-center h-96 space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center space-y-2">
            <h3 className="font-semibold">Unable to load availability</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {error}
            </p>
          </div>
          <Button onClick={handleRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("h-full flex flex-col lg:flex-row gap-6", className)}>
      
      {/* Calendar Section */}
      <Card className="flex-1 min-h-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {loading ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                monthName
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousMonth}
                disabled={loading}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                disabled={loading}
                className="hidden sm:flex"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextMonth}
                disabled={loading}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-6">
          {/* Calendar Grid */}
          <div className="space-y-4">
            
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <Button
                  key={day.date}
                  variant="ghost"
                  className={cn(
                    "h-12 p-0 font-normal relative transition-all duration-200",
                    !day.isCurrentMonth && "text-muted-foreground/40",
                    day.isToday && "bg-primary text-primary-foreground hover:bg-primary/90",
                    day.isPast && "text-muted-foreground/30 cursor-not-allowed",
                    day.isAvailable && !day.isPast && !day.isToday && "text-primary font-medium hover:bg-primary/10",
                    day.isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                    loading && "cursor-not-allowed opacity-50"
                  )}
                  onClick={() => handleDateSelect(day.date, day.isAvailable)}
                  disabled={loading || day.isPast || !day.isAvailable}
                >
                  <div className="flex flex-col items-center justify-center h-full w-full">
                    {loading ? (
                      <Skeleton className="h-4 w-4 rounded" />
                    ) : (
                      <>
                        <span className="text-sm">{day.dayNumber}</span>
                        {day.isAvailable && day.slotsCount > 0 && (
                          <div className="w-1 h-1 bg-current rounded-full mt-0.5" />
                        )}
                      </>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots Section */}
      <Card className="lg:w-80 min-h-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Available Times
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-6">
          {loading ? (
            // Loading skeleton
            <div className="space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          ) : selectedDate ? (
            // Selected date with time slots
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-medium">
                  {formatSelectedDate(selectedDate)}
                </h4>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {timeSlotsForSelectedDate.length} available
                  </Badge>
                  {timeSlotsForSelectedDate.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Select a time slot
                    </span>
                  )}
                </div>
              </div>

              {timeSlotsForSelectedDate.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {timeSlotsForSelectedDate.map((slot, index) => (
                    <Button
                      key={index}
                      variant={selectedSlot === slot.datetime ? "default" : "outline"}
                      className="w-full justify-start text-sm h-10"
                      onClick={() => handleSlotSelect(slot)}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {slot.time}
                    </Button>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No time slots available for this date.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            // No date selected
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/50" />
              <div className="space-y-1">
                <h4 className="font-medium text-muted-foreground">Select a Date</h4>
                <p className="text-sm text-muted-foreground">
                  Choose an available date from the calendar to see time slots
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function formatDate(date) {
  return date.toISOString().split('T')[0]
}

function isToday(date) {
  const today = new Date()
  return formatDate(date) === formatDate(today)
}

function isPast(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  return checkDate < today
}

function formatSelectedDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
}
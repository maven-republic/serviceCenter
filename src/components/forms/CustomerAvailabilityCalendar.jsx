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
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  RefreshCw,
  Info,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_MOBILE = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

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
  const [isMobile, setIsMobile] = useState(false)
  const [showTimeSlots, setShowTimeSlots] = useState(false)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Determine if we're in marketplace mode (no specific professional)
  const isMarketplaceMode = !professionalId || professionalId === null

  // Generate generic availability for marketplace mode
  const generateMarketplaceSlots = useCallback(() => {
    console.log('📅 Marketplace mode - generating generic time slots');
    
    const slots = []
    const today = new Date()
    
    for (let day = 1; day <= 30; day++) {
      const date = new Date(today)
      date.setDate(today.getDate() + day)
      
      // Skip weekends for business hours
      if (date.getDay() === 0 || date.getDay() === 6) continue
      
      const dateStr = formatDate(date)
      
      // Generate slots for business hours (8 AM to 6 PM)
      for (let hour = 8; hour <= 17; hour++) {
        const slotTime = new Date(date)
        slotTime.setHours(hour, 0, 0, 0)
        
        slots.push({
          date: dateStr,
          time: slotTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          datetime: slotTime.toISOString(),
          is_available: true,
          professional_id: null,
          type: 'marketplace'
        })
      }
    }
    
    return slots
  }, [])

  // Fetch available slots from API for specific professional
  const fetchProfessionalSlots = useCallback(async (startDate, endDate) => {
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

  // Main fetch function that handles both modes
  const fetchAvailableSlots = useCallback(async (startDate, endDate) => {
    if (isMarketplaceMode) {
      console.log('📅 Marketplace mode - generating generic time slots');
      setLoading(true)
      
      // Simulate a brief loading period for UX
      setTimeout(() => {
        const genericSlots = generateMarketplaceSlots()
        setAvailableSlots(genericSlots)
        setLoading(false)
      }, 300)
      
      return
    }

    // Fetch real availability for specific professional
    await fetchProfessionalSlots(startDate, endDate)
  }, [isMarketplaceMode, generateMarketplaceSlots, fetchProfessionalSlots])

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
    setShowTimeSlots(false)
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    setSelectedDate(null)
    setShowTimeSlots(false)
  }, [])

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date())
    setSelectedDate(null)
    setShowTimeSlots(false)
  }, [])

  // Event handlers
  const handleDateSelect = useCallback((dateStr, isAvailable) => {
    if (isAvailable && !loading) {
      setSelectedDate(selectedDate === dateStr ? null : dateStr)
      if (isMobile && isAvailable) {
        setShowTimeSlots(true)
      }
    }
  }, [selectedDate, loading, isMobile])

  const handleSlotSelect = useCallback((slot) => {
    onSlotSelect?.(slot.datetime)
    if (isMobile) {
      setShowTimeSlots(false)
    }
  }, [onSlotSelect, isMobile])

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

  // Get calendar title and description based on mode
  const getCalendarTitle = useCallback(() => {
    if (isMarketplaceMode) {
      return "Select Your Preferred Time"
    }
    return "Professional's Available Times"
  }, [isMarketplaceMode])

  const getCalendarDescription = useCallback(() => {
    if (isMarketplaceMode) {
      return "Choose when you'd like the work to be completed. Selected professionals will confirm availability."
    }
    return "Choose from the professional's available time slots."
  }, [isMarketplaceMode])

  // Format month name
  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  // Error state (only for professional mode)
  if (error && !isMarketplaceMode) {
    return (
      <Card className={cn("h-full", className)}>
        <CardContent className="flex flex-col items-center justify-center h-96 space-y-4 p-4">
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

  // Mobile Time Slots Modal/Sheet
  const MobileTimeSlotsSheet = () => (
    <div className={cn(
      "fixed inset-0 z-50 bg-background transition-transform duration-300 ease-in-out",
      showTimeSlots ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b bg-background sticky top-0">
          <div>
            <h3 className="font-semibold text-lg">
              {formatSelectedDate(selectedDate)}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={isMarketplaceMode ? "default" : "secondary"} 
                className={cn(
                  "text-xs",
                  isMarketplaceMode && "bg-blue-100 text-blue-800"
                )}
              >
                {timeSlotsForSelectedDate.length} {isMarketplaceMode ? "time options" : "available"}
              </Badge>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowTimeSlots(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {timeSlotsForSelectedDate.length > 0 ? (
            <div className="space-y-3">
              {timeSlotsForSelectedDate.map((slot, index) => (
                <Button
                  key={index}
                  variant={selectedSlot === slot.datetime ? "default" : "outline"}
                  className={cn(
                    "w-full justify-start text-base h-12 rounded-lg",
                    isMarketplaceMode && selectedSlot === slot.datetime && "bg-blue-600 hover:bg-blue-700",
                    isMarketplaceMode && selectedSlot !== slot.datetime && "border-blue-200 hover:bg-blue-50"
                  )}
                  onClick={() => handleSlotSelect(slot)}
                >
                  <Clock className="h-4 w-4 mr-3" />
                  {slot.time}
                  {isMarketplaceMode && (
                    <Badge variant="secondary" className="ml-auto text-xs bg-blue-100 text-blue-800">
                      Preferred
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isMarketplaceMode 
                  ? "No time options available for this date."
                  : "No time slots available for this date."
                }
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn("h-full flex flex-col gap-4", className)}>
      
      {/* Mode Indicator */}
      {isMarketplaceMode && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Marketplace Mode:</strong> {getCalendarDescription()}
          </AlertDescription>
        </Alert>
      )}
      
      <div className={cn(
        "flex gap-6",
        isMobile ? "flex-col" : "flex-col lg:flex-row"
      )}>
        {/* Calendar Section */}
        <Card className="flex-1 min-h-0">
          <CardHeader className={cn("pb-4", isMobile && "px-4 py-3")}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className={cn(
                  "font-semibold flex items-center gap-2",
                  isMobile ? "text-base" : "text-lg"
                )}>
                  {isMarketplaceMode ? (
                    <Users className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Calendar className="h-5 w-5" />
                  )}
                  {loading ? (
                    <Skeleton className="h-6 w-32" />
                  ) : (
                    getCalendarTitle()
                  )}
                </CardTitle>
                <p className={cn(
                  "text-muted-foreground",
                  isMobile ? "text-sm" : "text-sm"
                )}>
                  {monthName}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousMonth}
                  disabled={loading}
                  className={cn("h-8 w-8", isMobile && "h-9 w-9")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {!isMobile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    disabled={loading}
                    className="hidden sm:flex"
                  >
                    Today
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextMonth}
                  disabled={loading}
                  className={cn("h-8 w-8", isMobile && "h-9 w-9")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className={cn("pb-6", isMobile && "px-4 pb-4")}>
            {/* Calendar Grid */}
            <div className="space-y-4">
              
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1">
                {(isMobile ? WEEKDAYS_MOBILE : WEEKDAYS).map((day, index) => (
  <div 
    key={`weekday-${index}-${day}`} 
    className={cn(
                      "p-2 text-center font-medium text-muted-foreground",
                      isMobile ? "text-xs" : "text-sm"
                    )}
                  >
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
                      "font-normal relative transition-all duration-200 touch-target",
                      isMobile ? "h-12 p-0 text-sm" : "h-12 p-0",
                      !day.isCurrentMonth && "text-muted-foreground/40",
                      day.isToday && "bg-primary text-primary-foreground hover:bg-primary/90",
                      day.isPast && "text-muted-foreground/30 cursor-not-allowed",
                      day.isAvailable && !day.isPast && !day.isToday && (
                        isMarketplaceMode 
                          ? "text-blue-600 font-medium hover:bg-blue-50 border-blue-200" 
                          : "text-primary font-medium hover:bg-primary/10"
                      ),
                      day.isSelected && (
                        isMarketplaceMode 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      ),
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
                          <span className={cn("text-sm", isMobile && "text-xs")}>
                            {day.dayNumber}
                          </span>
                          {day.isAvailable && day.slotsCount > 0 && (
                            <div className={cn(
                              "w-1 h-1 rounded-full mt-0.5",
                              isMarketplaceMode ? "bg-blue-600" : "bg-current"
                            )} />
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

        {/* Desktop Time Slots Section */}
        {!isMobile && (
          <Card className="lg:w-80 min-h-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                {isMarketplaceMode ? "Preferred Times" : "Available Times"}
              </CardTitle>
              {isMarketplaceMode && (
                <p className="text-xs text-muted-foreground">
                  Select your preferred time. Professionals will confirm availability.
                </p>
              )}
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
                      <Badge 
                        variant={isMarketplaceMode ? "default" : "secondary"} 
                        className={cn(
                          "text-xs",
                          isMarketplaceMode && "bg-blue-100 text-blue-800"
                        )}
                      >
                        {timeSlotsForSelectedDate.length} {isMarketplaceMode ? "time options" : "available"}
                      </Badge>
                      {timeSlotsForSelectedDate.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {isMarketplaceMode ? "Select your preferred time" : "Select a time slot"}
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
                          className={cn(
                            "w-full justify-start text-sm h-10",
                            isMarketplaceMode && selectedSlot === slot.datetime && "bg-blue-600 hover:bg-blue-700",
                            isMarketplaceMode && selectedSlot !== slot.datetime && "border-blue-200 hover:bg-blue-50"
                          )}
                          onClick={() => handleSlotSelect(slot)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          {slot.time}
                          {isMarketplaceMode && (
                            <Badge variant="secondary" className="ml-auto text-xs bg-blue-100 text-blue-800">
                              Preferred
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {isMarketplaceMode 
                          ? "No time options available for this date."
                          : "No time slots available for this date."
                        }
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                // No date selected
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
                  {isMarketplaceMode ? (
                    <Users className="h-12 w-12 text-blue-400" />
                  ) : (
                    <Calendar className="h-12 w-12 text-muted-foreground/50" />
                  )}
                  <div className="space-y-1">
                    <h4 className="font-medium text-muted-foreground">Select a Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {isMarketplaceMode 
                        ? "Choose your preferred date to see time options"
                        : "Choose an available date from the calendar to see time slots"
                      }
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile Time Slots Sheet */}
      {isMobile && <MobileTimeSlotsSheet />}
      
      {/* Mobile Selected Time Display */}
      {isMobile && selectedDate && timeSlotsForSelectedDate.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <Button
            onClick={() => setShowTimeSlots(true)}
            className="w-full h-12 text-base bg-primary hover:bg-primary/90"
          >
            <Clock className="h-4 w-4 mr-2" />
            {selectedSlot ? 
              `Selected: ${timeSlotsForSelectedDate.find(s => s.datetime === selectedSlot)?.time}` :
              `View ${timeSlotsForSelectedDate.length} Available Times`
            }
          </Button>
        </div>
      )}
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
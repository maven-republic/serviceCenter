'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  AlertCircle,
  RefreshCw,
  Users,
  Star,
  Shield,
  DollarSign,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_MOBILE = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function CustomerAvailabilityCalendar({ 
  professionalId, 
  serviceId,
  selectedProfessionals = [],
  isMultiSelect = false,
  onSlotSelect, 
  selectedSlot,
  className = ''
}) {
  const [availableSlots, setAvailableSlots] = useState([])
  const [dayViewData, setDayViewData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dayViewLoading, setDayViewLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  
  // Animation states for the sliding layout
  const [isTimeSlotsVisible, setIsTimeSlotsVisible] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)

  // Prevent multiple simultaneous requests
  const fetchingRef = useRef(false)
  const lastFetchRef = useRef(null)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Stable mode detection
  const stableProfessionalIds = useMemo(() => {
    return selectedProfessionals.map(p => p.professional_id).sort().join(',')
  }, [selectedProfessionals])

  const appointmentMode = useMemo(() => {
    let mode
    if (professionalId && professionalId !== null) {
      mode = 'direct'
    } else if (selectedProfessionals && selectedProfessionals.length > 0) {
      mode = 'targeted'
    } else if (serviceId) {
      mode = 'marketplace'
    } else {
      mode = 'unknown'
    }
    
    console.log('=== APPOINTMENT MODE DEBUG ===')
    console.log('professionalId:', professionalId)
    console.log('selectedProfessionals:', selectedProfessionals)
    console.log('selectedProfessionals.length:', selectedProfessionals?.length)
    console.log('serviceId:', serviceId)
    console.log('calculated mode:', mode)
    
    return mode
  }, [professionalId, selectedProfessionals.length, serviceId])

  // Fetch calendar month availability (aggregated view)
  const fetchMonthlyAvailability = useCallback(async (startDate, endDate) => {
    if (fetchingRef.current) return

    const fetchKey = `${appointmentMode}-${startDate}-${endDate}-${stableProfessionalIds}-${professionalId}-${serviceId}`
    if (lastFetchRef.current === fetchKey) return

    fetchingRef.current = true
    setLoading(true)
    setError(null)

    try {
      let url
      let requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }

      switch (appointmentMode) {
        case 'direct':
          url = `/api/professionals/${professionalId}/appointment-availability?start_date=${startDate}&end_date=${endDate}&slot_duration=60`
          break
          
        case 'targeted':
          url = `/api/services/${serviceId}/specific-availability`
          requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              professional_ids: selectedProfessionals.map(p => p.professional_id),
              start_date: startDate,
              end_date: endDate,
              slot_duration: 60
            })
          }
          break
          
        case 'marketplace':
          url = `/api/services/${serviceId}/marketplace-availability?start_date=${startDate}&end_date=${endDate}&slot_duration=60`
          break
          
        default:
          throw new Error('Invalid appointment mode configuration')
      }

      console.log(`Fetching monthly ${appointmentMode} availability`)
      console.log('Request URL:', url)
      console.log('Request options:', requestOptions)
      
      const response = await fetch(url, requestOptions)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Monthly availability response:', data)
      
      let slots = []
      if (appointmentMode === 'targeted' && data.aggregated_slots) {
        slots = data.aggregated_slots
      } else {
        slots = data.available_slots || []
      }
      
      console.log('Processed slots:', slots)
      setAvailableSlots(slots)
      lastFetchRef.current = fetchKey
      
      console.log(`Monthly ${appointmentMode} mode: loaded ${slots.length} slots`)
      
    } catch (err) {
      console.error(`Error fetching monthly ${appointmentMode} availability:`, err)
      setError(err.message)
      lastFetchRef.current = null
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [appointmentMode, serviceId, professionalId, stableProfessionalIds, selectedProfessionals])

  // Fetch detailed day view for specific date (targeted mode)
  const fetchDayViewAvailability = useCallback(async (date) => {
    if (dayViewLoading) return

    console.log('=== FETCHING TARGETED DAY VIEW AVAILABILITY ===')
    console.log('date:', date)
    console.log('selectedProfessionals:', selectedProfessionals)

    setDayViewLoading(true)
    setDayViewData(null)
    setError(null)

    try {
      const promises = selectedProfessionals.map(async (professional) => {
        const url = `/api/professionals/${professional.professional_id}/appointment-availability?start_date=${date}&end_date=${date}&slot_duration=60`
        
        console.log(`Fetching for professional ${professional.professional_id}:`, url)
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Failed to fetch availability for ${professional.professional_id}`)
        }
        
        const data = await response.json()
        console.log(`Professional ${professional.professional_id} response:`, data)
        
        return {
          professional,
          slots: data.available_slots || [],
          error: null
        }
      })

      const results = await Promise.allSettled(promises)
      console.log('Targeted day view results:', results)
      
      const dayData = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          console.error(`Professional ${selectedProfessionals[index].professional_id} failed:`, result.reason)
          return {
            professional: selectedProfessionals[index],
            slots: [],
            error: result.reason.message
          }
        }
      }).filter(item => item.slots.length > 0 || item.error)

      const finalDayData = {
        date,
        professionals: dayData,
        totalAvailable: dayData.filter(item => item.slots.length > 0).length
      }

      console.log('Final targeted day data:', finalDayData)
      setDayViewData(finalDayData)

      console.log(`Targeted day view for ${date}: ${dayData.length} professionals processed`)
      
    } catch (err) {
      console.error(`Error fetching targeted day view for ${date}:`, err)
      setError(err.message)
    } finally {
      setDayViewLoading(false)
    }
  }, [selectedProfessionals, dayViewLoading])

  // Fetch marketplace day view - get all professionals offering service on specific date
  const fetchMarketplaceDayView = useCallback(async (date) => {
    if (dayViewLoading) return

    console.log('=== FETCHING MARKETPLACE DAY VIEW AVAILABILITY ===')
    console.log('date:', date)
    console.log('serviceId:', serviceId)

    setDayViewLoading(true)
    setDayViewData(null)
    setError(null)

    try {
      const url = `/api/services/${serviceId}/marketplace-availability?start_date=${date}&end_date=${date}&slot_duration=60`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch marketplace availability for ${date}`)
      }
      
      const data = await response.json()
      console.log('Marketplace day view response:', data)
      
      // Group slots by professional
      const professionalSlots = {}
      const slots = data.available_slots || []
      
      slots.forEach(slot => {
        if (slot.professional_id) {
          if (!professionalSlots[slot.professional_id]) {
            professionalSlots[slot.professional_id] = {
              professional: {
                professional_id: slot.professional_id,
                first_name: slot.professional_first_name || 'Professional',
                last_name: slot.professional_last_name || '',
                profile_picture_url: slot.professional_profile_picture,
                rating: slot.professional_rating || 4.8,
                verification_status: slot.professional_verification_status || 'pending',
                hourly_rate: slot.professional_hourly_rate
              },
              slots: [],
              error: null
            }
          }
          professionalSlots[slot.professional_id].slots.push(slot)
        }
      })

      const dayData = Object.values(professionalSlots).filter(item => item.slots.length > 0)

      const finalDayData = {
        date,
        professionals: dayData,
        totalAvailable: dayData.length
      }

      console.log('Final marketplace day data:', finalDayData)
      setDayViewData(finalDayData)

      console.log(`Marketplace day view for ${date}: ${dayData.length} professionals available`)
      
    } catch (err) {
      console.error(`Error fetching marketplace day view for ${date}:`, err)
      setError(err.message)
    } finally {
      setDayViewLoading(false)
    }
  }, [serviceId, dayViewLoading])

  // Calculate date range
  const dateRange = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const calendarStart = new Date(firstDay)
    calendarStart.setDate(calendarStart.getDate() - firstDay.getDay())
    
    const calendarEnd = new Date(calendarStart)
    calendarEnd.setDate(calendarEnd.getDate() + 41)
    
    return {
      startDate: formatDate(calendarStart),
      endDate: formatDate(calendarEnd)
    }
  }, [currentMonth])

  // Load monthly availability when dependencies change
  useEffect(() => {
    if (appointmentMode === 'unknown') return
    
    console.log('=== LOADING MONTHLY AVAILABILITY ===')
    console.log('appointmentMode:', appointmentMode)
    console.log('dateRange:', dateRange)
    
    fetchMonthlyAvailability(dateRange.startDate, dateRange.endDate)
  }, [
    fetchMonthlyAvailability, 
    dateRange.startDate, 
    dateRange.endDate
  ])

  // Reset cache when mode changes
  useEffect(() => {
    lastFetchRef.current = null
    setAvailableSlots([])
    setSelectedDate(null)
    setDayViewData(null)
    setIsTimeSlotsVisible(false)
  }, [appointmentMode, professionalId, serviceId, stableProfessionalIds])

  // Group monthly slots by date for calendar display
  const slotsByDate = useMemo(() => {
    const grouped = {}
    availableSlots.forEach(slot => {
      if (!grouped[slot.date]) grouped[slot.date] = []
      grouped[slot.date].push(slot)
    })
    console.log('=== SLOTS BY DATE ===')
    console.log('availableSlots:', availableSlots)
    console.log('grouped:', grouped)
    return grouped
  }, [availableSlots])

  const availableDates = useMemo(() => {
    const dates = Object.keys(slotsByDate).filter(date => slotsByDate[date].length > 0)
    console.log('=== AVAILABLE DATES ===')
    console.log('availableDates:', dates)
    return dates
  }, [slotsByDate])

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
    
    console.log('=== CALENDAR DAYS DEBUG ===')
    console.log('days with availability:', days.filter(d => d.isAvailable))
    
    return days
  }, [currentMonth, availableDates, selectedDate, slotsByDate])

  // Navigation handlers
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    setSelectedDate(null)
    setDayViewData(null)
    setIsTimeSlotsVisible(false)
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    setSelectedDate(null)
    setDayViewData(null)
    setIsTimeSlotsVisible(false)
  }, [])

  // Handle date selection with sliding animation
  const handleDateSelect = useCallback(async (dateStr, isAvailable) => {
    console.log('=== DATE SELECT DEBUG ===')
    console.log('dateStr:', dateStr)
    console.log('isAvailable:', isAvailable) 
    console.log('loading:', loading)
    console.log('appointmentMode:', appointmentMode)

    console.log('Slot structure check:', {
      dateStr,
      daySlots: slotsByDate[dateStr],
      firstSlot: slotsByDate[dateStr]?.[0],
      hasTime: slotsByDate[dateStr]?.[0]?.time,
      hasDatetime: slotsByDate[dateStr]?.[0]?.datetime
    })
    
    if (isAvailable && !loading) {
      console.log('Date selection conditions met')
      
      // If clicking same date, toggle visibility
      if (selectedDate === dateStr) {
        setIsTimeSlotsVisible(!isTimeSlotsVisible)
        return
      }
      
      // For different dates, prepare for slide transition
      if (selectedDate && selectedDate !== dateStr) {
        // If already showing slots for a different date, hide them first
        setIsTimeSlotsVisible(false)
        await new Promise(resolve => setTimeout(resolve, 300)) // Wait for slide out animation
      }
      
      setSelectedDate(dateStr)
      setAnimationKey(prev => prev + 1)
      
      // Fetch data based on appointment mode
      if (appointmentMode === 'targeted') {
        console.log('Targeted mode - fetching professionals for this date')
        await fetchDayViewAvailability(dateStr)
      } else if (appointmentMode === 'marketplace') {
        console.log('Marketplace mode - fetching all professionals for this date')
        await fetchMarketplaceDayView(dateStr)
      } else if (appointmentMode === 'direct') {
        console.log('Direct mode - fetching specific day data')
        
        setDayViewLoading(true)
        
        try {
          const url = `/api/professionals/${professionalId}/appointment-availability?start_date=${dateStr}&end_date=${dateStr}&slot_duration=60`
          const response = await fetch(url)
          const data = await response.json()
          
          if (response.ok && data.available_slots) {
            setDayViewData({
              date: dateStr,
              professionals: [{
                professional: { 
                  professional_id: professionalId,
                  first_name: 'Professional',
                  last_name: ''
                },
                slots: data.available_slots,
                error: null
              }],
              totalAvailable: data.available_slots.length > 0 ? 1 : 0
            })
          } else {
            console.error('Failed to fetch day data:', data)
            setDayViewData({
              date: dateStr,
              professionals: [],
              totalAvailable: 0
            })
          }
        } catch (error) {
          console.error('Error fetching direct mode day data:', error)
          setDayViewData({
            date: dateStr,
            professionals: [],
            totalAvailable: 0
          })
        } finally {
          setDayViewLoading(false)
        }
      }
      
      // Show time slots with slide-in animation after a brief delay
      setTimeout(() => {
        setIsTimeSlotsVisible(true)
      }, 200)
      
    } else {
      console.log('Conditions not met:')
      console.log('  - isAvailable:', isAvailable)
      console.log('  - !loading:', !loading)
    }
  }, [loading, appointmentMode, fetchDayViewAvailability, fetchMarketplaceDayView, slotsByDate, professionalId, selectedDate, isTimeSlotsVisible])

  // Handle slot selection
  const handleSlotSelect = useCallback((slot, professional) => {
    const slotInfo = {
      ...slot,
      mode: appointmentMode,
      selectedProfessional: professional
    }
    
    onSlotSelect?.(slot.datetime, slotInfo)
  }, [onSlotSelect, appointmentMode])

  const handleRetry = useCallback(() => {
    lastFetchRef.current = null
    fetchingRef.current = false
    fetchMonthlyAvailability(dateRange.startDate, dateRange.endDate)
  }, [fetchMonthlyAvailability, dateRange])

  // Get professional info helpers
  const getProfessionalName = useCallback((professional) => {
    const firstName = professional.first_name || professional.account?.first_name || ''
    const lastName = professional.last_name || professional.account?.last_name || ''
    const fullName = `${firstName} ${lastName}`.trim()
    return fullName || `Professional ${professional.professional_id.slice(0, 8)}`
  }, [])

  const getProfessionalRating = useCallback((professional) => {
    return professional.rating || professional.average_rating || 4.8
  }, [])

  const getProfessionalPrice = useCallback((professional) => {
    if (professional.hourly_rate) return `$${professional.hourly_rate}/hr`
    if (professional.daily_rate) return `$${professional.daily_rate}/day`
    return 'Quote'
  }, [])

  if (appointmentMode === 'unknown') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Calendar configuration error. Please refresh and try again.
        </AlertDescription>
      </Alert>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Unable to load availability</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
        <Button onClick={handleRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  // Mobile view - stacked layout (no sliding needed on mobile)
  if (isMobile) {
    return (
      <div className={cn("space-y-4", className)}>
        <style jsx>{`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{monthName}</h3>
          <div className="flex items-center gap-1">
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
              size="icon"
              onClick={goToNextMonth}
              disabled={loading}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card className="border-0 shadow-none">
          <CardContent className="p-3">
            <div className="space-y-1">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS_MOBILE.map((day, index) => (
                  <div 
                    key={`weekday-${index}`} 
                    className="h-8 flex items-center justify-center text-xs text-muted-foreground font-medium"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => (
                  <button
                    key={day.date}
                    className={cn(
                      "h-8 w-8 text-xs font-normal relative transition-all duration-200",
                      "flex items-center justify-center rounded-md",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      !day.isCurrentMonth && "text-muted-foreground/30",
                      day.isToday && !day.isSelected && "bg-accent text-accent-foreground",
                      day.isPast && "text-muted-foreground/20 cursor-not-allowed hover:bg-transparent",
                      day.isAvailable && !day.isPast && "font-medium cursor-pointer",
                      day.isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                      loading && "cursor-not-allowed opacity-50"
                    )}
                    onClick={() => handleDateSelect(day.date, day.isAvailable)}
                    disabled={loading || day.isPast || !day.isAvailable}
                  >
                    <span className="relative">
                      {day.dayNumber}
                      {day.isAvailable && day.slotsCount > 0 && !day.isSelected && (
                        <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-primary rounded-full" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Slots for Mobile - Standard slide down */}
        {selectedDate && (
          <div 
            key={`mobile-timeslots-${animationKey}`}
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              isTimeSlotsVisible 
                ? "max-h-[600px] opacity-100 transform translate-y-0" 
                : "max-h-0 opacity-0 transform -translate-y-4"
            )}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Available Times</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {dayViewLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : dayViewData && dayViewData.professionals.length > 0 ? (
                  dayViewData.professionals.map((item) => {
                    const professional = item.professional
                    const slots = item.slots
                    
                    return (
                      <div key={professional.professional_id} className="space-y-2">
                        {appointmentMode !== 'direct' && (
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={professional.profile_picture_url} />
                              <AvatarFallback className="text-xs">
                                {getProfessionalName(professional).substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {getProfessionalName(professional)}
                            </span>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map((slot, index) => {
                            const isSelected = (() => {
                              if (!selectedSlot) return false;
                              
                              if (isMultiSelect) {
                                // Multi-select mode: check professionalSelections object
                                const professionalId = professional.professional_id;
                                const selection = selectedSlot[professionalId];
                                return selection && selection.datetime === slot.datetime;
                              } else {
                                // Single-select mode: original logic
                                if (typeof selectedSlot === 'string') {
                                  return selectedSlot === slot.datetime;
                                }
                                if (typeof selectedSlot === 'object' && selectedSlot?.datetime) {
                                  return selectedSlot.datetime === slot.datetime;
                                }
                              }
                              
                              return false;
                            })();
                            return (
                              <Button
                                key={index}
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleSlotSelect(slot, professional)}
                                className="text-xs transition-all duration-200 hover:scale-105"
                                style={{
                                  animationDelay: `${index * 50}ms`,
                                  animation: isTimeSlotsVisible ? 'slideInUp 300ms ease-out forwards' : 'none'
                                }}
                              >
                                {slot.time}
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No times available on this date
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {!selectedDate && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            {loading ? "Loading availability..." : "Select a date to view available times"}
          </div>
        )}
      </div>
    )
  }

  // Desktop view - sliding layout
  return (
    <div className={cn("", className)}>
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      
      <div className="flex gap-6 h-full transition-all duration-500 ease-in-out">
        
        {/* Calendar Section - Slides to left and shrinks when date selected */}
        <div className={cn(
          "transition-all duration-500 ease-in-out space-y-4",
          isTimeSlotsVisible ? "w-1/2 flex-shrink-0" : "w-full"
        )}>
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{monthName}</h3>
            <div className="flex items-center gap-1">
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
                size="icon"
                onClick={goToNextMonth}
                disabled={loading}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <Card className="border-0 shadow-none">
            <CardContent className="p-3">
              <div className="space-y-1">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {WEEKDAYS.map((day, index) => (
                    <div 
                      key={`weekday-${index}`} 
                      className="h-10 flex items-center justify-center text-sm text-muted-foreground font-medium"
                    >
                      {day.slice(0, 2)}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => (
                    <button
                      key={day.date}
                      className={cn(
                        "h-10 w-10 text-sm font-normal relative transition-all duration-200",
                        "flex items-center justify-center rounded-md",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        !day.isCurrentMonth && "text-muted-foreground/30",
                        day.isToday && !day.isSelected && "bg-accent text-accent-foreground",
                        day.isPast && "text-muted-foreground/20 cursor-not-allowed hover:bg-transparent",
                        day.isAvailable && !day.isPast && "font-medium cursor-pointer",
                        day.isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                        loading && "cursor-not-allowed opacity-50"
                      )}
                      onClick={() => handleDateSelect(day.date, day.isAvailable)}
                      disabled={loading || day.isPast || !day.isAvailable}
                    >
                      <span className="relative">
                        {day.dayNumber}
                        {day.isAvailable && day.slotsCount > 0 && !day.isSelected && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {!selectedDate && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              {loading ? "Loading availability..." : "Select a date to view available times"}
            </div>
          )}
        </div>

        {/* Time Slots Section - Slides in from right when date selected */}
        {selectedDate && (
          <div 
            key={`desktop-timeslots-${animationKey}`}
            className={cn(
              "w-1/2 flex-shrink-0 space-y-4 transition-all duration-500 ease-in-out",
              isTimeSlotsVisible 
                ? "opacity-100 transform translate-x-0" 
                : "opacity-0 transform translate-x-8"
            )}
            style={{
              animation: isTimeSlotsVisible ? 'slideInFromRight 500ms ease-out forwards' : 'none'
            }}
          >
            <div>
              <h3 className="font-semibold text-lg">Available Times</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            <Card>
              <CardContent className="p-4">
                {dayViewLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading times...</span>
                  </div>
                ) : dayViewData && dayViewData.professionals.length > 0 ? (
                  <div className="space-y-4">
                    {dayViewData.professionals.map((item) => {
                      const professional = item.professional
                      const slots = item.slots
                      const error = item.error
                      
                      return (
                        <div key={professional.professional_id} className="space-y-3">
                          {/* Professional Header (only show for multi-professional modes) */}
                          {appointmentMode !== 'direct' && (
                            <div className="flex items-center gap-3 pb-2 border-b">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={professional.profile_picture_url} />
                                <AvatarFallback className="text-xs">
                                  {getProfessionalName(professional).substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm">{getProfessionalName(professional)}</h4>
                                  {professional.verification_status === 'verified' && (
                                    <Shield className="h-3 w-3 text-green-600" />
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>{getProfessionalRating(professional)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    <span>{getProfessionalPrice(professional)}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {slots.length} slot{slots.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          )}

                          {/* Error State */}
                          {error ? (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-sm">{error}</AlertDescription>
                            </Alert>
                          ) : slots.length > 0 ? (
                            /* Time Slots Grid with staggered animation */
                            <div className="grid grid-cols-3 gap-2">
                              {slots.map((slot, index) => {
                                const isSelected = (() => {
                                  if (!selectedSlot) return false;
                                  
                                  if (isMultiSelect) {
                                    // Multi-select mode: check professionalSelections object
                                    const professionalId = professional.professional_id;
                                    const selection = selectedSlot[professionalId];
                                    return selection && selection.datetime === slot.datetime;
                                  } else {
                                    // Single-select mode: original logic
                                    if (typeof selectedSlot === 'string') {
                                      return selectedSlot === slot.datetime;
                                    }
                                    if (typeof selectedSlot === 'object' && selectedSlot?.datetime) {
                                      return selectedSlot.datetime === slot.datetime;
                                    }
                                  }
                                  
                                  return false;
                                })();

                                return (
                                  <Button
                                    key={index}
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleSlotSelect(slot, professional)}
                                    className="text-sm h-9 transition-all duration-200 hover:scale-105"
                                    style={{
                                      animationDelay: `${index * 50 + 200}ms`, // Delayed after panel slide
                                      animation: isTimeSlotsVisible ? 'slideInUp 300ms ease-out forwards' : 'none'
                                    }}
                                  >
                                    {slot.time}
                                  </Button>
                                )
                              })}
                            </div>
                          ) : (
                            /* No Slots Available */
                            <div className="text-center py-4">
                              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                No times available
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  /* No Professionals Available */
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">
                      No availability on this date
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try selecting a different date
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
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
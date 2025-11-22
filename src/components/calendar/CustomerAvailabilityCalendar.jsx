'use client'

import { useMemo, useEffect } from 'react'
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
  Star,
  Shield,
  DollarSign,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppointmentMode } from '@/components/calendar/primitives/useAppointmentMode'
import { useCalendarState } from '@/components/calendar/primitives/useCalendarState'
import { useAvailabilityData } from '@/components/calendar/primitives/useAvailabilityData'
import { useMediaQuery } from '@/primitives/useMediaQuery'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_MOBILE = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function CustomerAvailabilityCalendar({ 
  professionalId, 
  serviceId,
  selectedProfessionals = [],
  isMultiSelect = false,
  onSlotSelect, 
  selectedSlot,
  durationMinutes = 60,
  className = ''
}) {
  // ==================== HOOKS ====================
  
  // Determine appointment mode
  const appointmentMode = useAppointmentMode(professionalId, serviceId, selectedProfessionals)
  
  // Calendar state management
  const calendarState = useCalendarState('day')
  
  // Mobile detection
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  // Calculate date range for availability fetch
  const dateRange = useMemo(() => {
    const year = calendarState.currentDate.getFullYear()
    const month = calendarState.currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const calendarStart = new Date(firstDay)
    calendarStart.setDate(calendarStart.getDate() - firstDay.getDay())
    
    const calendarEnd = new Date(calendarStart)
    calendarEnd.setDate(calendarEnd.getDate() + 41)
    
    return {
      startDate: calendarStart,
      endDate: calendarEnd
    }
  }, [calendarState.currentDate])
  
  // Fetch availability data using new API
  const availability = useAvailabilityData({
    serviceId,
    mode: appointmentMode.mode,
    professionalIds: appointmentMode.professionalIds,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    durationMinutes
  })

  // ==================== COMPUTED VALUES ====================
  
  // Get available dates from availability data
  const availableDates = useMemo(() => {
    if (!availability.data?.byDate) return []
    return Object.keys(availability.data.byDate).filter(date => {
      const slots = availability.data.byDate[date]
      return slots && slots.length > 0 && slots.some(slot => slot.available)
    })
  }, [availability.data])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = calendarState.currentDate.getFullYear()
    const month = calendarState.currentDate.getMonth()
    
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
          isSelected: calendarState.selectedDate === dateStr,
          slotsCount: availability.data?.byDate[dateStr]?.length || 0
        })
        
        current.setDate(current.getDate() + 1)
      }
    }
    
    return days
  }, [calendarState.currentDate, calendarState.selectedDate, availableDates, availability.data])

  // Get day view data for selected date
  const dayViewData = useMemo(() => {
    if (!calendarState.selectedDate || !availability.data) return null
    
    const dateSlots = availability.data.byDate[calendarState.selectedDate]
    if (!dateSlots) return null
    
    // Group slots by professional for multi-professional modes
    if (appointmentMode.isTargeted || appointmentMode.isMarketplace) {
      const professionalGroups = {}
      
      dateSlots.forEach(timeSlot => {
        timeSlot.slots?.forEach(slot => {
          const profId = slot.professionalId
          if (!professionalGroups[profId]) {
            professionalGroups[profId] = {
              professional: availability.data.professionals[profId] || {
                id: profId,
                name: 'Unknown Professional'
              },
              slots: [],
              error: null
            }
          }
          
          if (slot.available) {
            professionalGroups[profId].slots.push({
              time: timeSlot.time,
              datetime: timeSlot.start || `${calendarState.selectedDate}T${timeSlot.time}:00`,
              available: true,
              conflicts: slot.conflicts || []
            })
          }
        })
      })
      
      return {
        date: calendarState.selectedDate,
        professionals: Object.values(professionalGroups).filter(g => g.slots.length > 0),
        totalAvailable: Object.keys(professionalGroups).length
      }
    }
    
    // Direct mode - single professional
    if (appointmentMode.isDirect) {
      const slots = dateSlots
        .filter(slot => slot.available)
        .map(slot => ({
          time: slot.time,
          datetime: slot.start || `${calendarState.selectedDate}T${slot.time}:00`,
          available: true,
          conflicts: []
        }))
      
      return {
        date: calendarState.selectedDate,
        professionals: [{
          professional: availability.data.professionals[appointmentMode.professionalIds[0]] || {
            id: appointmentMode.professionalIds[0],
            name: 'Professional'
          },
          slots,
          error: null
        }],
        totalAvailable: slots.length > 0 ? 1 : 0
      }
    }
    
    return null
  }, [calendarState.selectedDate, availability.data, appointmentMode])

  // ==================== EVENT HANDLERS ====================
  
  const handleDateSelect = (dateStr, isAvailable) => {
    if (!isAvailable || availability.loading) return
    
    // Toggle if clicking same date
    if (calendarState.selectedDate === dateStr) {
      calendarState.setSelectedDate(null)
      return
    }
    
    calendarState.handleDateSelect(dateStr)
  }

  const handleSlotSelect = (slot, professional) => {
    console.log('🎯 [CustomerAvailabilityCalendar] handleSlotSelect called!', {
      slot,
      professional,
      hasOnSlotSelectCallback: !!onSlotSelect,
      onSlotSelectType: typeof onSlotSelect
    })
    
    const slotInfo = {
      ...slot,
      mode: appointmentMode.mode,
      selectedProfessional: professional,
      professionalId: professional.id
    }
    
    console.log('🎯 [CustomerAvailabilityCalendar] Prepared slotInfo:', slotInfo)
    console.log('🎯 [CustomerAvailabilityCalendar] Calling onSlotSelect with:', {
      datetime: slot.datetime,
      slotInfo
    })
    
    if (isMultiSelect) {
      // Track the selection internally for this professional
      calendarState.handleProfessionalSlotSelect(professional.id, slotInfo)
      // Still pass datetime and slotInfo for consistency with parent expectations
      onSlotSelect?.(slot.datetime, slotInfo)
    } else {
      // Single select mode
      onSlotSelect?.(slot.datetime, slotInfo)
    }
    
    console.log('✅ [CustomerAvailabilityCalendar] onSlotSelect callback completed')
  }

  const handlePreviousMonth = () => {
    calendarState.goToPrevious()
    calendarState.setSelectedDate(null)
  }

  const handleNextMonth = () => {
    calendarState.goToNext()
    calendarState.setSelectedDate(null)
  }

  // ==================== HELPERS ====================
  
  const getProfessionalName = (professional) => {
    return professional.name || `Professional ${professional.id?.slice(0, 8) || 'Unknown'}`
  }

  const getProfessionalRating = (professional) => {
    return professional.rating || professional.average_rating || 4.8
  }

  const getProfessionalPrice = (professional) => {
    if (professional.hourly_rate) return `$${professional.hourly_rate}/hr`
    if (professional.daily_rate) return `$${professional.daily_rate}/day`
    return 'Quote'
  }

  const monthName = calendarState.currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  // ==================== RENDER CONDITIONS ====================
  
  if (!appointmentMode.isValid) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Calendar configuration error. Please refresh and try again.
        </AlertDescription>
      </Alert>
    )
  }

  if (availability.error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Unable to load availability</p>
          <p className="text-xs text-muted-foreground">{availability.error}</p>
        </div>
        <Button 
          type="button"
          onClick={availability.refetch} 
          variant="outline" 
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  // ==================== MOBILE LAYOUT ====================
  
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
              type="button"
              variant="outline"
              size="icon"
              onClick={handlePreviousMonth}
              disabled={availability.loading}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              disabled={availability.loading}
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
                    type="button"
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
                      availability.loading && "cursor-not-allowed opacity-50"
                    )}
                    onClick={() => handleDateSelect(day.date, day.isAvailable)}
                    disabled={availability.loading || day.isPast || !day.isAvailable}
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

        {/* Time Slots for Mobile */}
        {calendarState.selectedDate && (
          <div 
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              calendarState.selectedDate 
                ? "max-h-[600px] opacity-100 transform translate-y-0" 
                : "max-h-0 opacity-0 transform -translate-y-4"
            )}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Available Times</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(calendarState.selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {availability.loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : dayViewData && dayViewData.professionals.length > 0 ? (
                  dayViewData.professionals.map((item) => {
                    const professional = item.professional
                    const slots = item.slots
                    
                    return (
                      <div key={professional.id} className="space-y-2">
                        {!appointmentMode.isDirect && (
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
                            const isSelected = isMultiSelect
                              ? calendarState.professionalSelections[professional.id]?.datetime === slot.datetime
                              : selectedSlot === slot.datetime || selectedSlot?.datetime === slot.datetime
                            
                            return (
                              <Button
                                key={index}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleSlotSelect(slot, professional)}
                                className="text-xs transition-all duration-200 hover:scale-105"
                                style={{
                                  animationDelay: `${index * 50}ms`,
                                  animation: 'slideInUp 300ms ease-out forwards'
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

        {!calendarState.selectedDate && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            {availability.loading ? "Loading availability..." : "Select a date to view available times"}
          </div>
        )}
      </div>
    )
  }

  // ==================== DESKTOP LAYOUT ====================
  
  return (
    <div className={cn("w-full", className)}>
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
      
      <div className="space-y-4">
        
        {/* Calendar Section */}
        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base">{monthName}</h3>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handlePreviousMonth}
                disabled={availability.loading}
                className="h-7 w-7"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
                disabled={availability.loading}
                className="h-7 w-7"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <Card className="border-0 shadow-none">
            <CardContent className="p-2">
              <div className="space-y-1">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEKDAYS.map((day, index) => (
                    <div 
                      key={`weekday-${index}`} 
                      className="h-7 flex items-center justify-center text-xs text-muted-foreground font-medium"
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
                      type="button"
                      className={cn(
                        "h-7 w-7 text-xs font-normal relative transition-all duration-200",
                        "flex items-center justify-center rounded-md",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus:outline-none focus:ring-1 focus:ring-ring",
                        !day.isCurrentMonth && "text-muted-foreground/30",
                        day.isToday && !day.isSelected && "bg-accent text-accent-foreground",
                        day.isPast && "text-muted-foreground/20 cursor-not-allowed hover:bg-transparent",
                        day.isAvailable && !day.isPast && "font-medium cursor-pointer",
                        day.isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                        availability.loading && "cursor-not-allowed opacity-50"
                      )}
                      onClick={() => handleDateSelect(day.date, day.isAvailable)}
                      disabled={availability.loading || day.isPast || !day.isAvailable}
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

          {!calendarState.selectedDate && (
            <div className="text-center py-3 text-xs text-muted-foreground">
              {availability.loading ? "Loading availability..." : "Select a date to view available times"}
            </div>
          )}
        </div>

        {/* Time Slots Section */}
        {calendarState.selectedDate && (
          <div 
            className="space-y-3 transition-all duration-300 ease-in-out"
            style={{
              animation: 'fadeIn 400ms ease-out forwards'
            }}
          >
            <div className="pb-2 border-b">
              <h3 className="font-semibold text-sm">Available Times</h3>
              <p className="text-xs text-muted-foreground">
                {new Date(calendarState.selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
            <div>
                {availability.loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-xs text-muted-foreground">Loading times...</span>
                  </div>
                ) : dayViewData && dayViewData.professionals.length > 0 ? (
                  <div className="space-y-3">
                    {dayViewData.professionals.map((item) => {
                      const professional = item.professional
                      const slots = item.slots
                      
                      return (
                        <div key={professional.id} className="space-y-2">
                          {/* Professional Header */}
                          {!appointmentMode.isDirect && (
                            <div className="flex items-center gap-2 pb-2 border-b">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={professional.profile_picture_url} />
                                <AvatarFallback className="text-xs">
                                  {getProfessionalName(professional).substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-medium text-xs">{getProfessionalName(professional)}</h4>
                                  {professional.verification_status === 'verified' && (
                                    <Shield className="h-2.5 w-2.5 text-green-600" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-0.5">
                                    <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                                    <span>{getProfessionalRating(professional)}</span>
                                  </div>
                                  <div className="flex items-center gap-0.5">
                                    <DollarSign className="h-2.5 w-2.5" />
                                    <span>{getProfessionalPrice(professional)}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs h-5">
                                {slots.length}
                              </Badge>
                            </div>
                          )}

                          {/* Time Slots Grid */}
                          {slots.length > 0 ? (
                            <div className="grid grid-cols-4 gap-1.5">
                              {slots.map((slot, index) => {
                                const isSelected = isMultiSelect
                                  ? calendarState.professionalSelections[professional.id]?.datetime === slot.datetime
                                  : selectedSlot === slot.datetime || selectedSlot?.datetime === slot.datetime

                                return (
                                  <Button
                                    key={index}
                                    type="button"
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleSlotSelect(slot, professional)}
                                    className="text-xs h-7 transition-all duration-200 hover:scale-105"
                                    style={{
                                      animationDelay: `${index * 30}ms`,
                                      animation: 'slideInUp 250ms ease-out forwards'
                                    }}
                                  >
                                    {slot.time}
                                  </Button>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-3">
                              <Clock className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                              <p className="text-xs text-muted-foreground">
                                No times available
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <AlertCircle className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs font-medium text-muted-foreground">
                      No availability on this date
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Try selecting a different date
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== HELPER FUNCTIONS ====================

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
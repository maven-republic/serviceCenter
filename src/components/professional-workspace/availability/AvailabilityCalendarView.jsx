'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Info,
  Plus,
  Circle,
  Edit
} from 'lucide-react'

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Helper functions to replace date-fns
const formatDate = (date, formatStr) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December']
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  if (formatStr === 'MMMM yyyy') {
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  } else if (formatStr === 'd') {
    return date.getDate().toString()
  } else if (formatStr === 'yyyy-MM-dd') {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  } else if (formatStr === 'EEEE, MMMM d, yyyy') {
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  } else if (formatStr === 'EEEE') {
    return days[date.getDay()]
  }
  return date.toDateString()
}

const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

const isSameMonth = (date1, date2) => {
  return date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

const startOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

const endOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

const startOfWeek = (date) => {
  const result = new Date(date)
  const day = result.getDay()
  const diff = day
  return new Date(result.setDate(result.getDate() - diff))
}

const endOfWeek = (date) => {
  const result = new Date(date)
  const day = result.getDay()
  const diff = 6 - day
  return new Date(result.setDate(result.getDate() + diff))
}

const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const addMonths = (date, months) => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

const subMonths = (date, months) => {
  const result = new Date(date)
  result.setMonth(result.getMonth() - months)
  return result
}

function formatTime12(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return ''
  
  try {
    let timeOnly = timeStr.includes('T') 
      ? timeStr.split('T')[1]?.split('.')[0] || timeStr 
      : timeStr
    
    timeOnly = timeOnly.split('+')[0].split('-')[0].split('Z')[0]
    
    if (!timeOnly.includes(':')) return timeStr
    
    const [hours, minutes] = timeOnly.split(':').map(num => parseInt(num, 10))
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return timeStr
    }
    
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    const displayMinutes = minutes.toString().padStart(2, '0')
    
    return `${displayHours}:${displayMinutes} ${ampm}`
  } catch (error) {
    return timeStr || ''
  }
}

export default function AvailabilityCalendarView({
  availability = [],
  overrides = [],
  onUpdateOverride = () => {},
  onDeleteOverride = () => {},
  onUpdateRecurring = () => {}
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const start = startOfWeek(startOfMonth(currentDate))
  const end = endOfWeek(endOfMonth(currentDate))

  const dateRange = []
  let day = start
  while (day <= end) {
    dateRange.push(day)
    day = addDays(day, 1)
  }

  const getDayContent = (date) => {
    const dow = date.getDay()
    const iso = formatDate(date, 'yyyy-MM-dd')
    const recurring = availability.filter(a => a.day_of_week === dow)
    const override = overrides.filter(o => o.override_date === iso)
    return { recurring, override, hasContent: recurring.length > 0 || override.length > 0 }
  }

  const goToPrevious = () => setCurrentDate(prev => subMonths(prev, 1))
  const goToNext = () => setCurrentDate(prev => addMonths(prev, 1))
  const goToToday = () => setCurrentDate(new Date())

  const handleDayClick = (date) => {
    setSelectedDate(date)
    setShowDetailsModal(true)
  }

  const getDuration = (start, end) => {
    try {
      const startDate = new Date(`2000-01-01 ${start}`)
      const endDate = new Date(`2000-01-01 ${end}`)
      const diffMs = endDate - startDate
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
    } catch {
      return ''
    }
  }

  const CalendarDay = ({ date }) => {
    const isToday = isSameDay(date, new Date())
    const inCurrentMonth = isSameMonth(date, currentDate)
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
    const { recurring, override, hasContent } = getDayContent(date)
    const displaySlots = override.length > 0 ? override : recurring
    const isOverride = override.length > 0

    return (
      <button
        onClick={() => handleDayClick(date)}
        disabled={isPast}
        className={`
          relative min-h-[80px] p-2 border-b border-r text-left
          transition-all duration-200 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary
          ${!inCurrentMonth ? 'bg-muted/30 opacity-60' : 'bg-background'}
          ${isToday ? 'bg-primary/5 border-l-2 border-l-primary' : ''}
          ${hasContent && !isToday ? 'border-l-2 border-l-green-500' : ''}
          ${isPast ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${isOverride ? 'bg-amber-50/30' : ''}
        `}
      >
        {/* Date Number */}
        <div className="flex items-start justify-between mb-1.5">
          <span className={`
            text-sm font-medium leading-none
            ${isToday ? 'flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground' : ''}
            ${!inCurrentMonth && !isToday ? 'text-muted-foreground' : 'text-foreground'}
          `}>
            {formatDate(date, 'd')}
          </span>
          
          {/* Indicators */}
          <div className="flex items-center gap-1">
            {isOverride && (
              <Circle className="h-2 w-2 fill-amber-500 text-amber-500" />
            )}
            {hasContent && !isOverride && (
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
            )}
          </div>
        </div>

        {/* Time Slots Preview */}
        <div className="space-y-0.5">
          {displaySlots.slice(0, 2).map((slot, idx) => (
            <div 
              key={idx}
              className={`
                text-xs px-1.5 py-0.5 rounded truncate font-medium
                ${isOverride 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-green-100 text-green-800'
                }
              `}
            >
              {formatTime12(slot.start_time)}
            </div>
          ))}
          {displaySlots.length > 2 && (
            <div className="text-xs text-muted-foreground text-center font-medium">
              +{displaySlots.length - 2}
            </div>
          )}
        </div>

        {/* Hover Overlay */}
        {!isPast && (
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-200 pointer-events-none rounded-sm" />
        )}
      </button>
    )
  }

  const DayDetailsModal = () => {
    if (!selectedDate) return null
    
    const { recurring, override } = getDayContent(selectedDate)
    const allSlots = override.length > 0 ? override : recurring
    const isOverride = override.length > 0
    const isPast = selectedDate < new Date(new Date().setHours(0, 0, 0, 0))

    return (
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {formatDate(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
            <DialogDescription>
              {isOverride 
                ? 'This date has custom hours (override)'
                : recurring.length > 0 
                ? 'Regular weekly schedule'
                : 'No availability set for this day'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isSameDay(selectedDate, new Date()) && (
              <Badge variant="default" className="w-fit">Today</Badge>
            )}

            {isOverride && (
              <Alert className="bg-amber-50 border-amber-200">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700 text-sm">
                  These custom hours override the regular weekly schedule
                </AlertDescription>
              </Alert>
            )}

            {allSlots.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Time Slots</h4>
                {allSlots.map((slot, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatTime12(slot.start_time)} — {formatTime12(slot.end_time)}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {getDuration(slot.start_time, slot.end_time)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  {isPast ? 'No availability was set' : 'No availability for this day'}
                </p>
              </div>
            )}

            {!isPast && (
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false)
                    // Trigger your existing edit date modal
                    // You'll need to wire this up to your existing SingleDateEditorModal
                  }}
                  className="w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit This Date
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false)
                    // Trigger your existing recurring edit modal
                    // You'll need to wire this up to your existing RecurringDayEditorModal
                  }}
                  className="w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Edit All {formatDate(selectedDate, 'EEEE')}s
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={goToPrevious}
            className="h-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={goToToday}
            className="h-9 px-4"
          >
            Today
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={goToNext}
            className="h-9"
         >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="text-lg font-semibold">
          {formatDate(currentDate, 'MMMM yyyy')}
        </h2>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b bg-muted/30">
            {weekdayLabels.map((label, idx) => (
              <div 
                key={idx} 
                className="p-2 text-center text-xs font-medium text-muted-foreground border-r last:border-r-0"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {dateRange.map((date, idx) => (
              <CalendarDay key={idx} date={date} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-muted/20 border-muted">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                <span>Regular hours</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Circle className="h-2 w-2 fill-amber-500 text-amber-500" />
                <span>Date override</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full border-2 border-primary" />
                <span>Today</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>Click days for details</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <DayDetailsModal />
    </div>
  )
}
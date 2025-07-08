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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Calendar,
  ChevronLeft, 
  ChevronRight,
  Clock,
  Info,
  Eye
} from 'lucide-react'

// Helper functions to replace date-fns
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

const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const startOfWeek = (date, options = { weekStartsOn: 0 }) => {
  const result = new Date(date)
  const day = result.getDay()
  const diff = (day < options.weekStartsOn ? 7 : 0) + day - options.weekStartsOn
  return new Date(result.setDate(result.getDate() - diff))
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

const formatDate = (date, options) => {
  return date.toLocaleDateString('en-US', options)
}

export default function AvailabilityCalendar({ availability = [], overrides = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeView, setActiveView] = useState('Month')

  // 🐛 DEBUG: Log what data we receive
  console.log('🎯 AvailabilityCalendar received:', {
    availability,
    availabilityLength: availability?.length,
    overrides,
    overridesLength: overrides?.length
  })

  // 🕒 Helper function to format time display
  const formatTime = (timeString) => {
    if (!timeString) return ''
    
    // Handle different time formats (HH:MM:SS or HH:MM)
    const time = timeString.split(':')
    const hours = parseInt(time[0])
    const minutes = time[1] || '00'
    
    // Convert to 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    
    return `${displayHours}:${minutes} ${ampm}`
  }

  // 📅 Enhanced function to get availability for a specific date
  const getAvailabilityForDate = (date) => {
    const dateStr = formatDate(date, { year: 'numeric', month: '2-digit', day: '2-digit' })
      .split('/').reverse().join('-') // Convert to YYYY-MM-DD
    const weekdayIndex = date.getDay() // 0 = Sunday, 1 = Monday, etc.

    console.log(`🔍 Looking for availability on ${formatDate(date, { weekday: 'long' })} (index: ${weekdayIndex})`)

    // Check for overrides first
    const override = overrides.find(o => o.override_date === dateStr)
    if (override) {
      console.log('📋 Found override for', dateStr)
      return override.is_available
        ? [{ start_time: override.start_time, end_time: override.end_time, isOverride: true }]
        : []
    }

    // Get regular availability based on day of week
    const matchingSlots = availability.filter(a => {
      console.log(`🔍 Checking slot: day_of_week=${a.day_of_week} (type: ${typeof a.day_of_week}) vs weekdayIndex=${weekdayIndex}`)
      
      if (typeof a.day_of_week === 'number') {
        return a.day_of_week === weekdayIndex
      }
      if (typeof a.day_of_week === 'string') {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const dayIndex = dayNames.indexOf(a.day_of_week.toLowerCase())
        return dayIndex === weekdayIndex
      }
      return false
    })

    console.log(`✅ Found ${matchingSlots.length} slots for ${formatDate(date, { weekday: 'long' })}:`, matchingSlots)
    return matchingSlots
  }

  const handlePrev = () => {
    if (activeView === 'Month') setCurrentDate(prev => subMonths(prev, 1))
    else if (activeView === 'Week') setCurrentDate(prev => addDays(prev, -7))
    else setCurrentDate(prev => addDays(prev, -1))
  }

  const handleNext = () => {
    if (activeView === 'Month') setCurrentDate(prev => addMonths(prev, 1))
    else if (activeView === 'Week') setCurrentDate(prev => addDays(prev, 7))
    else setCurrentDate(prev => addDays(prev, 1))
  }

  const handleToday = () => setCurrentDate(new Date())

  const getDaysInMonth = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const days = []
    const firstDayIndex = start.getDay()
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(start)
      d.setDate(d.getDate() - i - 1)
      days.push(d)
    }
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d))
    }
    const totalCells = Math.ceil(days.length / 7) * 7
    while (days.length < totalCells) {
      const d = new Date(days[days.length - 1])
      d.setDate(d.getDate() + 1)
      days.push(d)
    }
    return days
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 }) // Sunday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i))

  const getViewTitle = () => {
    if (activeView === 'Day') {
      return formatDate(currentDate, { weekday: 'long', month: 'long', day: 'numeric' })
    } else if (activeView === 'Week') {
      return `${formatDate(weekDays[0], { month: 'short', day: 'numeric' })} - ${formatDate(weekDays[6], { month: 'short', day: 'numeric', year: 'numeric' })}`
    } else {
      return formatDate(currentDate, { month: 'long', year: 'numeric' })
    }
  }

  const getStats = () => {
    const totalSlots = availability.length + overrides.length
    const activeDays = new Set(availability.map(a => a.day_of_week)).size
    const overrideCount = overrides.length
    
    return { totalSlots, activeDays, overrideCount }
  }

  const stats = getStats()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground">Availability Overview</h2>
          </div>
          <p className="text-muted-foreground">
            View your current schedule and availability patterns
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">{stats.activeDays} active days</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">{stats.overrideCount} overrides</span>
          </div>
        </div>
      </div>

      {/* Navigation and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePrev}
                className="h-9 px-3"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleToday}
                className="h-9 px-4"
              >
                Today
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNext}
                className="h-9 px-3"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Title */}
            <div className="text-center flex-1">
              <h3 className="text-xl font-semibold text-foreground">
                {getViewTitle()}
              </h3>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-3">
              {/* Desktop View Toggle */}
              <div className="hidden md:flex border rounded-lg p-1 bg-muted/50">
                {['Day', 'Week', 'Month'].map((mode) => (
                  <Button
                    key={mode}
                    variant={mode === activeView ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveView(mode)}
                    className="h-8 px-4 text-sm"
                  >
                    {mode}
                  </Button>
                ))}
              </div>

              {/* Mobile View Toggle */}
              <div className="md:hidden">
                <Select value={activeView} onValueChange={setActiveView}>
                  <SelectTrigger className="w-32 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Day">Day View</SelectItem>
                    <SelectItem value="Week">Week View</SelectItem>
                    <SelectItem value="Month">Month View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* DAY VIEW */}
          {activeView === 'Day' && (
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium">
                    {formatDate(currentDate, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h4>
                  {isSameDay(currentDate, new Date()) && (
                    <Badge variant="default">Today</Badge>
                  )}
                </div>
                
                <div className="space-y-3">
                  {getAvailabilityForDate(currentDate).map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                        </span>
                      </div>
                      {slot.isOverride && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                          Override
                        </Badge>
                      )}
                    </div>
                  ))}
                  {getAvailabilityForDate(currentDate).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No availability for this day</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* WEEK VIEW */}
          {activeView === 'Week' && (
            <div className="p-6">
              <div className="grid grid-cols-7 gap-4">
                {weekDays.map((day, i) => {
                  const isToday = isSameDay(day, new Date())
                  const slots = getAvailabilityForDate(day)
                  return (
                    <div key={i} className="space-y-2">
                      <div className={`text-center p-2 rounded-lg ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <div className="text-sm font-medium">
                          {formatDate(day, { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-bold">
                          {day.getDate()}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {slots.length > 0 ? (
                          slots.slice(0, 3).map((s, idx) => (
                            <div key={idx} className="text-xs p-2 rounded bg-green-100 text-green-800">
                              {formatTime(s.start_time)} – {formatTime(s.end_time)}
                              {s.isOverride && (
                                <Badge variant="secondary" className="ml-1 text-xs bg-amber-100 text-amber-700">
                                  Override
                                </Badge>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-muted-foreground text-center py-2">
                            No availability
                          </div>
                        )}
                        {slots.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{slots.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* MONTH VIEW */}
          {activeView === 'Month' && (
            <div>
              {/* Weekdays Header */}
              <div className="grid grid-cols-7 border-b bg-muted/50">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                  <div key={idx} className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 divide-x divide-y">
                {daysInMonth.map((day, i) => {
                  const isToday = isSameDay(day, new Date())
                  const inCurrentMonth = isSameMonth(day, currentDate)
                  const slots = getAvailabilityForDate(day)

                  return (
                    <div
                      key={i}
                      className={`
                        min-h-[100px] p-2 
                        ${inCurrentMonth ? 'bg-background' : 'bg-muted/30 opacity-60'}
                        ${isToday ? 'bg-primary/5' : ''}
                        ${slots.length > 0 ? 'border-l-2 border-l-green-500' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                          ${isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'}
                        `}>
                          {day.getDate()}
                        </div>
                        {slots.length > 0 && (
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                        )}
                      </div>

                      <div className="space-y-1">
                        {slots.slice(0, 2).map((slot, idx) => (
                          <div key={idx} className="text-xs p-1 rounded bg-green-100 text-green-700 truncate">
                            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                            {slot.isOverride && (
                              <div className="text-xs text-amber-600">Override</div>
                            )}
                          </div>
                        ))}
                        {slots.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{slots.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Available hours</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Date override</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-primary" />
                <span>Today</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Read-only calendar view</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
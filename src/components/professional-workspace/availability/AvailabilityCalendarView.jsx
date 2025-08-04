'use client'

import {
  format, parse, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, addDays,
  isSameMonth, isSameDay, isValid
} from 'date-fns'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  MoreVertical,
  Edit,
  Repeat,
  Clock,
  AlertCircle,
  Info,
  Plus,
  Eye
} from 'lucide-react'
import EditAvailabilityMenu from './EditAvailabilityMenu'
import SingleDateEditorModal from './SingleDateEditorModal'
import RecurringDayEditorModal from './RecurringDayEditorModal'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatTime12(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') {
    console.warn('Invalid time string:', timeStr)
    return ''
  }
  
  try {
    // Handle different time formats
    let timeOnly = timeStr
    
    // If it's a full datetime string, extract just the time part
    if (timeStr.includes('T')) {
      timeOnly = timeStr.split('T')[1]?.split('.')[0] || timeStr
    }
    
    // Remove any timezone info
    timeOnly = timeOnly.split('+')[0].split('-')[0].split('Z')[0]
    
    // Ensure we have HH:MM format
    if (!timeOnly.includes(':')) {
      console.warn('Time string missing colon:', timeStr)
      return timeStr // Return as-is if we can't parse it
    }
    
    const [hours, minutes] = timeOnly.split(':').map(num => parseInt(num, 10))
    
    // Validate hours and minutes
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.warn('Invalid hours or minutes:', { hours, minutes, original: timeStr })
      return timeStr
    }
    
    // Convert to 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    const displayMinutes = minutes.toString().padStart(2, '0')
    
    return `${displayHours}:${displayMinutes} ${ampm}`
  } catch (error) {
    console.error('Error formatting time:', { timeStr, error })
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
  const [activeDate, setActiveDate] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editTargetDate, setEditTargetDate] = useState(null)
  const [editingWeekdayIndex, setEditingWeekdayIndex] = useState(null)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [viewMode, setViewMode] = useState('Month') // 'Day', 'Week', or 'Month'

  // Debug logging
  console.log('🔍 Debug availability data:', availability)
  console.log('🔍 Debug overrides data:', overrides)
  
  // Check for problematic time values
  availability.forEach((item, index) => {
    if (!item.start_time || !item.end_time) {
      console.warn(`⚠️ Availability item ${index} has missing times:`, item)
    }
  })
  
  overrides.forEach((item, index) => {
    if (!item.start_time || !item.end_time) {
      console.warn(`⚠️ Override item ${index} has missing times:`, item)
    }
  })

  const start = viewMode === 'Month' 
    ? startOfWeek(startOfMonth(currentDate)) 
    : viewMode === 'Week'
    ? startOfWeek(currentDate)
    : currentDate
    
  const end = viewMode === 'Month' 
    ? endOfWeek(endOfMonth(currentDate)) 
    : viewMode === 'Week'
    ? endOfWeek(currentDate)
    : currentDate

  const dateRange = []
  let day = start
  while (day <= end) {
    dateRange.push(day)
    day = addDays(day, 1)
  }

  const getDayContent = (date) => {
    const dow = date.getDay()
    const iso = format(date, 'yyyy-MM-dd')
    const recurring = availability.filter(a => a.day_of_week === dow)
    const override = overrides.filter(o => o.override_date === iso)
    return { recurring, override }
  }

  const goToPreviousMonth = () => {
    if (viewMode === 'Month') {
      setCurrentDate(prev => addDays(startOfMonth(prev), -1))
    } else if (viewMode === 'Week') {
      setCurrentDate(prev => addDays(prev, -7))
    } else {
      setCurrentDate(prev => addDays(prev, -1))
    }
    setActiveDate(null)
  }

  const goToNextMonth = () => {
    if (viewMode === 'Month') {
      setCurrentDate(prev => addDays(endOfMonth(prev), 1))
    } else if (viewMode === 'Week') {
      setCurrentDate(prev => addDays(prev, 7))
    } else {
      setCurrentDate(prev => addDays(prev, 1))
    }
    setActiveDate(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setActiveDate(null)
  }

  const handleDayClick = (date) => {
    setActiveDate(activeDate && format(activeDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') ? null : date)
  }

  const handleEditDate = (date) => {
    setEditTargetDate(date)
    setShowModal(true)
  }

  const handleUpdateOverride = (date, blocks) => {
    const iso = format(date, 'yyyy-MM-dd')
    const formatted = blocks.map(b => ({
      override_date: iso,
      start_time: b.start_time,
      end_time: b.end_time,
      is_available: true
    }))
    onUpdateOverride(iso, formatted)
    setShowModal(false)
  }

  const handleResetOverride = (date) => {
    const iso = format(date, 'yyyy-MM-dd')
    onDeleteOverride(iso)
    setShowModal(false)
  }

  const getViewTitle = () => {
    if (viewMode === 'Day') {
      return format(currentDate, 'EEEE, MMMM d, yyyy')
    } else if (viewMode === 'Week') {
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
    } else {
      return format(currentDate, 'MMMM yyyy')
    }
  }

  return (
    <div className="professional-workspace max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Navigation */}
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={goToPreviousMonth}
            className="h-9 px-3"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
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
            onClick={goToNextMonth}
            className="h-9 px-3"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Title */}
        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold text-foreground">
            {getViewTitle()}
          </h2>
        </div>
        
        {/* View Controls */}
        <div className="flex items-center gap-3">
          {/* Desktop View Toggle */}
          <div className="hidden md:flex border rounded-lg p-1 bg-muted/50">
            {['Day', 'Week', 'Month'].map((mode) => (
              <Button
                key={mode}
                variant={mode === viewMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="h-8 px-4 text-sm"
              >
                {mode}
              </Button>
            ))}
          </div>

          {/* Mobile View Toggle */}
          <div className="md:hidden">
            <Select value={viewMode} onValueChange={setViewMode}>
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

      {/* Calendar Content */}
      {viewMode === 'Day' ? (
        // DAY VIEW
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-content-center font-bold text-lg
                  ${isSameDay(currentDate, new Date()) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                `}>
                  {format(currentDate, 'd')}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {format(currentDate, 'EEEE, MMMM d, yyyy')}
                  </CardTitle>
                  <CardDescription>
                    {isSameDay(currentDate, new Date()) && (
                      <Badge variant="default" className="mt-1">Today</Badge>
                    )}
                  </CardDescription>
                </div>
              </div>
              
              {(() => {
                const isPast = currentDate < new Date(new Date().setHours(0, 0, 0, 0))
                return !isPast && (
                  <Button 
                    variant="outline"
                    onClick={() => handleEditDate(currentDate)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Day
                  </Button>
                )
              })()}
            </div>
          </CardHeader>
          
          <CardContent>
            {(() => {
              const { recurring, override } = getDayContent(currentDate)
              const allSlots = override.length > 0 ? override : recurring
              const isPast = currentDate < new Date(new Date().setHours(0, 0, 0, 0))
              
              if (allSlots.length === 0) {
                return (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No availability set</h3>
                    <p className="text-muted-foreground mb-4">
                      {isPast ? 'This day has passed' : 'Click to add your available hours for this day'}
                    </p>
                    {!isPast && (
                      <Button onClick={() => handleEditDate(currentDate)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Hours
                      </Button>
                    )}
                  </div>
                )
              }
              
              return (
                <div className="space-y-4">
                  {/* Time slots grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allSlots.map((slot, i) => (
                      <Card key={i} className={`
                        ${slot.is_available === false ? 'border-destructive bg-destructive/5' : 'border-border'}
                      `}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {override.length > 0 ? (
                              <Calendar className="h-4 w-4 text-amber-600" />
                            ) : (
                              <Repeat className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Badge variant={override.length > 0 ? "secondary" : "outline"} className="text-xs">
                              {override.length > 0 ? 'Override' : 'Regular'}
                            </Badge>
                            {slot.is_available === false && (
                              <Badge variant="destructive">Blocked</Badge>
                            )}
                          </div>
                          
                          <div className={`
                            text-lg font-semibold mb-2
                            ${slot.is_available === false ? 'text-destructive' : 'text-foreground'}
                          `}>
                            {formatTime12(slot.start_time)} – {formatTime12(slot.end_time)}
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            Duration: {(() => {
                              const start = new Date(`2000-01-01 ${slot.start_time}`)
                              const end = new Date(`2000-01-01 ${slot.end_time}`)
                              const diffMs = end - start
                              const hours = Math.floor(diffMs / (1000 * 60 * 60))
                              const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                              return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
                            })()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {override.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Date Override:</strong> These hours override your regular weekly schedule for this date.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      ) : (
        // WEEK & MONTH VIEW
        <Card>
          <CardContent className="p-0">
            {/* Weekdays Header */}
            <div className="hidden md:grid grid-cols-7 border-b bg-muted/50">
              {weekdays.map((day, i) => (
                <div 
                  key={i} 
                  className="p-3 text-center font-medium text-muted-foreground text-sm border-r last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 divide-x divide-y border-b">
              {dateRange.map((date, idx) => {
                const isToday = isSameDay(date, new Date())
                const isOtherMonth = viewMode === 'Month' ? !isSameMonth(date, currentDate) : false
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
                const dateKey = format(date, 'yyyy-MM-dd')
                const { recurring, override } = getDayContent(date)
                const showMenu = !isPast && activeDate && format(activeDate, 'yyyy-MM-dd') === dateKey
                const hasAvailability = recurring.length > 0 || override.length > 0

                return (
                  <div
                    key={idx}
                    className={`
                      relative min-h-[120px] ${viewMode === 'Week' ? 'min-h-[140px]' : ''} p-2
                      ${!isPast ? 'cursor-pointer hover:bg-muted/30' : 'cursor-not-allowed'}
                      ${isOtherMonth ? 'opacity-60 bg-muted/20' : ''}
                      ${isPast ? 'opacity-50' : ''}
                      ${isToday ? 'bg-primary/5' : ''}
                      ${hasAvailability ? 'bg-green-50/50' : ''}
                    `}
                    onClick={() => !isPast && handleDayClick(date)}
                  >
                    {/* Date Number */}
                    <div className="flex items-center justify-center mb-2">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'}
                        ${isOtherMonth ? 'text-muted-foreground' : ''}
                      `}>
                        {format(date, 'd')}
                      </div>
                    </div>

                    {/* Mobile Day Label */}
                    {viewMode === 'Week' && (
                      <div className="text-center text-xs text-muted-foreground mb-2 md:hidden">
                        {format(date, 'EEE')}
                      </div>
                    )}

                    {/* Availability Content */}
                    <div className="space-y-1">
                      {override.length > 0 ? (
                        <>
                          {override.slice(0, viewMode === 'Week' ? 4 : 2).map((o, i) => (
                            <div 
                              key={i} 
                              className={`
                                text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 truncate
                                ${o.is_available === false ? 'bg-red-100 text-red-800' : ''}
                              `}
                            >
                              <Calendar className="inline h-3 w-3 mr-1" />
                              {formatTime12(o.start_time)} – {formatTime12(o.end_time)}
                              {o.is_available === false && ' (Blocked)'}
                            </div>
                          ))}
                          {override.length > (viewMode === 'Week' ? 4 : 2) && (
                            <div className="text-xs text-muted-foreground text-center px-1">
                              +{override.length - (viewMode === 'Week' ? 4 : 2)} more
                            </div>
                          )}
                        </>
                      ) : recurring.length > 0 ? (
                        <>
                          {recurring.slice(0, viewMode === 'Week' ? 4 : 2).map((r, i) => (
                            <div 
                              key={i} 
                              className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 truncate"
                            >
                              <Repeat className="inline h-3 w-3 mr-1" />
                              {formatTime12(r.start_time)} – {formatTime12(r.end_time)}
                            </div>
                          ))}
                          {recurring.length > (viewMode === 'Week' ? 4 : 2) && (
                            <div className="text-xs text-muted-foreground text-center px-1">
                              +{recurring.length - (viewMode === 'Week' ? 4 : 2)} more
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground text-center mt-4">
                          {!isPast ? 'Click to add' : 'No availability'}
                        </div>
                      )}
                    </div>

                    {/* Edit Menu */}
                    {showMenu && (
                      <EditAvailabilityMenu
                        date={date}
                        onEditDate={(d) => {
                          setActiveDate(null)
                          handleEditDate(d)
                        }}
                        onEditDay={(dayIndex) => {
                          setActiveDate(null)
                          setEditingWeekdayIndex(dayIndex)
                          setShowRecurringModal(true)
                        }}
                      />
                    )}

                    {/* Availability Indicator Dot */}
                    {hasAvailability && (
                      <div className="absolute top-2 right-2">
                        <div 
                          className={`w-2 h-2 rounded-full ${override.length > 0 ? 'bg-amber-500' : 'bg-green-500'}`}
                          title={override.length > 0 ? 'Has overrides' : 'Regular availability'}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile List View (shown on small screens for month view) */}
      <div className="md:hidden space-y-3">
        {dateRange.filter(date => isSameMonth(date, currentDate)).map((date, idx) => {
          const isToday = isSameDay(date, new Date())
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
          const { recurring, override } = getDayContent(date)
          const hasAvailability = recurring.length > 0 || override.length > 0

          return (
            <Card 
              key={idx}
              className={`
                ${isToday ? 'border-primary' : ''}
                ${hasAvailability ? 'border-green-200' : ''}
                ${isPast ? 'opacity-50' : ''}
              `}
              onClick={() => !isPast && handleDayClick(date)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className={`font-medium ${isToday ? 'text-primary' : ''}`}>
                      {format(date, 'EEEE, MMM d')}
                    </h3>
                    {isToday && <Badge variant="default" className="mt-1">Today</Badge>}
                  </div>
                  {hasAvailability && (
                    <Badge variant={override.length > 0 ? "secondary" : "outline"}>
                      {override.length > 0 ? 'Override' : 'Available'}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1 text-sm">
                  {override.length > 0 ? (
                    override.map((o, i) => (
                      <div key={i} className={`flex items-center gap-2 ${o.is_available === false ? 'text-destructive' : 'text-primary'}`}>
                        <Calendar className="h-3 w-3" />
                        {formatTime12(o.start_time)} – {formatTime12(o.end_time)}
                        {o.is_available === false && ' (Blocked)'}
                      </div>
                    ))
                  ) : recurring.length > 0 ? (
                    recurring.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-primary">
                        <Repeat className="h-3 w-3" />
                        {formatTime12(r.start_time)} – {formatTime12(r.end_time)}
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground">No availability</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Regular hours</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Date override</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-primary" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Click any day to edit hours</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showModal && editTargetDate && (
        <SingleDateEditorModal
          date={editTargetDate}
          existing={overrides.filter(o => o.override_date === format(editTargetDate, 'yyyy-MM-dd'))}
          onSave={(blocks) => handleUpdateOverride(editTargetDate, blocks)}
          onReset={() => handleResetOverride(editTargetDate)}
          onClose={() => setShowModal(false)}
        />
      )}

      {showRecurringModal && editingWeekdayIndex !== null && (
        <RecurringDayEditorModal
          dayIndex={editingWeekdayIndex}
          dayLabel={weekdays[editingWeekdayIndex]}
          availability={availability}
          setAvailability={onUpdateRecurring}
          onClose={() => {
            setShowRecurringModal(false)
            setEditingWeekdayIndex(null)
          }}
        />
      )}
    </div>
  )
}
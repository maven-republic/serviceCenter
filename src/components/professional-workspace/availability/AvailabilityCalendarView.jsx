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
    let timeOnly = timeStr
    
    if (timeStr.includes('T')) {
      timeOnly = timeStr.split('T')[1]?.split('.')[0] || timeStr
    }
    
    timeOnly = timeOnly.split('+')[0].split('-')[0].split('Z')[0]
    
    if (!timeOnly.includes(':')) {
      console.warn('Time string missing colon:', timeStr)
      return timeStr
    }
    
    const [hours, minutes] = timeOnly.split(':').map(num => parseInt(num, 10))
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.warn('Invalid hours or minutes:', { hours, minutes, original: timeStr })
      return timeStr
    }
    
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
  const [viewMode, setViewMode] = useState('Month')

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

  const goToPrevious = () => {
    if (viewMode === 'Month') {
      setCurrentDate(prev => addDays(startOfMonth(prev), -1))
    } else if (viewMode === 'Week') {
      setCurrentDate(prev => addDays(prev, -7))
    } else {
      setCurrentDate(prev => addDays(prev, -1))
    }
    setActiveDate(null)
  }

  const goToNext = () => {
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
      return format(currentDate, 'EEE, MMM d')
    } else if (viewMode === 'Week') {
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
    } else {
      return format(currentDate, 'MMMM yyyy')
    }
  }

  return (
    <div className="space-y-4">
      {/* Mobile Header Controls */}
      <div className="space-y-3">
        {/* Navigation Row */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={goToPrevious}
            className="h-10 px-3"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 text-center">
            <h2 className="text-lg font-bold text-foreground">
              {getViewTitle()}
            </h2>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={goToNext}
            className="h-10 px-3"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Controls Row */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={goToToday}
            className="h-10 px-4"
          >
            Today
          </Button>
          
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="flex-1 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Month">Month View</SelectItem>
              <SelectItem value="Week">Week View</SelectItem>
              <SelectItem value="Day">Day View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Content */}
      {viewMode === 'Day' ? (
        // MOBILE DAY VIEW
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                  ${isSameDay(currentDate, new Date()) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                `}>
                  {format(currentDate, 'd')}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {format(currentDate, 'EEEE')}
                  </CardTitle>
                  <CardDescription>
                    {format(currentDate, 'MMMM d, yyyy')}
                    {isSameDay(currentDate, new Date()) && (
                      <Badge variant="default" className="ml-2">Today</Badge>
                    )}
                  </CardDescription>
                </div>
              </div>
              
              {(() => {
                const isPast = currentDate < new Date(new Date().setHours(0, 0, 0, 0))
                return !isPast && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditDate(currentDate)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
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
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No availability</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {isPast ? 'This day has passed' : 'Tap to add your available hours'}
                    </p>
                    {!isPast && (
                      <Button onClick={() => handleEditDate(currentDate)} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Hours
                      </Button>
                    )}
                  </div>
                )
              }
              
              return (
                <div className="space-y-3">
                  {allSlots.map((slot, i) => (
                    <Card key={i} className={`
                      ${slot.is_available === false ? 'border-destructive bg-destructive/5' : 'border-border'}
                    `}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
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
                          text-xl font-bold mb-2
                          ${slot.is_available === false ? 'text-destructive' : 'text-foreground'}
                        `}>
                          {formatTime12(slot.start_time)} — {formatTime12(slot.end_time)}
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
                  
                  {override.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Date Override:</strong> These hours override your regular weekly schedule.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      ) : (
        // MOBILE WEEK & MONTH VIEW - List Format
        <div className="space-y-3">
          {dateRange.filter(date => viewMode === 'Month' ? isSameMonth(date, currentDate) : true).map((date, idx) => {
            const isToday = isSameDay(date, new Date())
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
            const { recurring, override } = getDayContent(date)
            const hasAvailability = recurring.length > 0 || override.length > 0
            const showMenu = !isPast && activeDate && format(activeDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')

            return (
              <Card 
                key={idx}
                className={`
                  ${isToday ? 'border-primary bg-primary/5' : ''}
                  ${hasAvailability ? 'border-green-200 bg-green-50/30' : ''}
                  ${isPast ? 'opacity-60' : 'cursor-pointer'}
                  transition-all duration-200
                `}
                onClick={() => !isPast && handleDayClick(date)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                        ${isToday ? 'bg-primary text-primary-foreground' : hasAvailability ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}
                      `}>
                        {format(date, 'd')}
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                          {format(date, 'EEEE')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(date, 'MMM d, yyyy')}
                        </p>
                        {isToday && <Badge variant="default" className="mt-1 text-xs">Today</Badge>}
                      </div>
                    </div>
                    
                    {hasAvailability && (
                      <Badge variant={override.length > 0 ? "secondary" : "outline"} className="text-xs">
                        {override.length > 0 ? 'Override' : 'Available'}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Time Slots */}
                  <div className="space-y-2">
                    {override.length > 0 ? (
                      override.slice(0, 3).map((o, i) => (
                        <div key={i} className={`flex items-center gap-2 text-sm ${o.is_available === false ? 'text-destructive' : 'text-primary'}`}>
                          <Calendar className="h-3 w-3" />
                          <span className="font-medium">
                            {formatTime12(o.start_time)} — {formatTime12(o.end_time)}
                          </span>
                          {o.is_available === false && <span className="text-destructive">(Blocked)</span>}
                        </div>
                      ))
                    ) : recurring.length > 0 ? (
                      recurring.slice(0, 3).map((r, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-primary">
                          <Repeat className="h-3 w-3" />
                          <span className="font-medium">
                            {formatTime12(r.start_time)} — {formatTime12(r.end_time)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {isPast ? 'No availability' : 'Tap to add hours'}
                      </div>
                    )}
                    
                    {/* Show more indicator */}
                    {((override.length > 3) || (recurring.length > 3 && override.length === 0)) && (
                      <div className="text-xs text-muted-foreground">
                        +{(override.length > 0 ? override.length : recurring.length) - 3} more
                      </div>
                    )}
                  </div>

                  {/* Edit Menu for Mobile */}
                  {showMenu && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveDate(null)
                          handleEditDate(date)
                        }}
                        className="w-full"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Edit this date
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveDate(null)
                          setEditingWeekdayIndex(date.getDay())
                          setShowRecurringModal(true)
                        }}
                        className="w-full"
                      >
                        <Repeat className="h-4 w-4 mr-2" />
                        Edit all {format(date, 'EEEE')}s
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Mobile Legend */}
      <Card className="bg-muted/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
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
            <div className="flex items-center gap-2">
              <Info className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground text-xs">Tap days to edit</span>
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
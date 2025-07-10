// src/components/professional-workspace/section/income/calendar/AnalyticsCalendar.jsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar as CalendarIcon, 
  X,
  Clock,
  Target,
  CheckCircle,
  BarChart3,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import CalendarHeader from './CalendarHeader'
import CalendarSlot from './CalendarSlot'

// Professional utility functions using semantic design patterns
const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

const getFirstDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
}

const isToday = (date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const isSameDay = (date1, date2) => {
  return date1 && date2 && date1.toDateString() === date2.toDateString()
}

const generateCalendarDays = (currentMonth) => {
  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = []

  // Previous month's trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const prevDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), -i)
    days.push({
      date: prevDate,
      isCurrentMonth: false,
      day: prevDate.getDate()
    })
  }

  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    days.push({
      date,
      isCurrentMonth: true,
      day
    })
  }

  // Next month's leading days to fill the grid (6 rows × 7 days = 42 cells)
  const remainingCells = 42 - days.length
  for (let day = 1; day <= remainingCells; day++) {
    const nextDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day)
    days.push({
      date: nextDate,
      isCurrentMonth: false,
      day: nextDate.getDate()
    })
  }

  return days
}

const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return ''
  
  const start = startDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: startDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  })
  
  const end = endDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: endDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  })
  
  return `${start} - ${end}`
}

const calculateRangeDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0
  const timeDiff = endDate.getTime() - startDate.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AnalyticsCalendar({ 
  selectedRange = null,
  selectedDate = null,        
  onRangeSelect = null,
  onDateSelect = null,        
  onClose = null,
  compact = false,
  showRangeSelection = true,
  showLegend = true,
  earningsData = null,
  showEarnings = false
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isSelectingRange, setIsSelectingRange] = useState(false)
  const [rangeStart, setRangeStart] = useState(null)

  // Professional date click handler with enhanced logic
  const handleDateClick = (date, isCurrentMonth) => {
    if (!isCurrentMonth) return
    
    console.log('📅 Date clicked:', date)
    
    // Single date selection mode
    if (!showRangeSelection && onDateSelect) {
      console.log('📅 Single date mode - calling onDateSelect')
      onDateSelect(date)
      return
    }

    // Range selection mode
    if (showRangeSelection && onRangeSelect) {
      console.log('📅 Range selection mode')
      
      if (!isSelectingRange) {
        // Start range selection
        setRangeStart(date)
        setIsSelectingRange(true)
        console.log('📅 Started range selection with:', date)
      } else {
        // Complete range selection
        const startDate = rangeStart
        const endDate = date
        
        // Ensure start <= end
        const finalRange = startDate <= endDate 
          ? { startDate, endDate }
          : { startDate: endDate, endDate: startDate }
        
        console.log('📅 Completed range selection:', finalRange)
        onRangeSelect(finalRange)
        setIsSelectingRange(false)
        setRangeStart(null)
      }
    }
  }

  // Professional month navigation
  const handleMonthChange = (newMonth) => {
    setCurrentMonth(newMonth)
    // Reset range selection when navigating
    if (isSelectingRange) {
      setIsSelectingRange(false)
      setRangeStart(null)
    }
  }

  // Professional cancel range selection
  const handleCancelRangeSelection = () => {
    setIsSelectingRange(false)
    setRangeStart(null)
  }

  // Generate calendar data
  const calendarDays = generateCalendarDays(currentMonth)

  // Professional selection analysis
  const getSelectionAnalysis = () => {
    if (showRangeSelection && selectedRange?.startDate && selectedRange?.endDate) {
      const duration = calculateRangeDuration(selectedRange.startDate, selectedRange.endDate)
      const rangeType = duration <= 7 ? 'short' : duration <= 30 ? 'medium' : 'long'
      return { duration, rangeType, hasRange: true }
    }
    
    if (!showRangeSelection && selectedDate) {
      return { hasDate: true, isToday: isToday(selectedDate) }
    }
    
    return { isEmpty: true }
  }

  const analysis = getSelectionAnalysis()

  return (
    <Card className={cn(
      "professional-workspace bg-card border-border",
      compact ? "w-80" : "w-96"
    )}>
      
      {/* Professional Header */}
      <CardHeader className={cn(
        "bg-muted/30 border-b border-border",
        compact ? "pb-3" : "pb-4"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <CardTitle className={cn(
              "text-foreground",
              compact ? "text-sm" : "text-base"
            )}>
              {showRangeSelection ? 'Analytics Calendar' : 'Date Selector'}
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Professional mode indicator */}
            <Badge variant="outline" className="text-xs bg-background border-border">
              {showRangeSelection ? (
                <>
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Range Mode
                </>
              ) : (
                <>
                  <Target className="h-3 w-3 mr-1" />
                  Single Mode
                </>
              )}
            </Badge>
            
            {onClose && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Professional instruction text */}
        {!compact && (
          <p className="text-xs text-muted-foreground">
            {showRangeSelection 
              ? 'Click start date, then end date to select analytics range' 
              : 'Click any date to select for analysis'
            }
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4 p-6">
        
        {/* Professional Month Navigation */}
        <CalendarHeader
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          compact={compact}
          showTodayButton={true}
          showQuickNavigation={!compact}
          showRelativeInfo={!compact}
        />

        {/* Professional Weekday Headers */}
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map(day => (
            <div 
              key={day} 
              className="h-8 w-9 flex items-center justify-center text-xs font-medium text-muted-foreground bg-muted/30 rounded-sm"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Professional Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayInfo, index) => (
            <CalendarSlot
              key={index}
              dayInfo={dayInfo}
              selectedDate={selectedDate}
              selectedRange={selectedRange}
              onDateClick={() => handleDateClick(dayInfo.date, dayInfo.isCurrentMonth)}
              isSelectingRange={isSelectingRange}
              rangeStart={rangeStart}
              earningsData={earningsData?.[dayInfo.date.toDateString()]}
              compact={compact}
              showEarnings={showEarnings}
            />
          ))}
        </div>

        {/* Professional Range Selection Status */}
        {showRangeSelection && isSelectingRange && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-primary animate-pulse" />
                  <span className="text-xs font-medium text-primary">
                    Selecting Range...
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelRangeSelection}
                  className="h-6 text-xs px-2 hover:bg-primary/10"
                >
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Started: {rangeStart?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}. 
                Click end date to complete selection.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Professional Selection Display */}
        {analysis.hasRange && (
          <Card className="bg-background border-border">
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium text-foreground">
                      Range Selected
                    </span>
                  </div>
                  <Badge 
                    variant={analysis.rangeType === 'short' ? 'default' : 
                             analysis.rangeType === 'medium' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {analysis.duration} day{analysis.duration !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDateRange(selectedRange.startDate, selectedRange.endDate)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {analysis.hasDate && (
          <Card className="bg-background border-border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    Date Selected
                  </span>
                </div>
                {analysis.isToday && (
                  <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Today
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Professional Legend */}
        {showLegend && !compact && (
          <>
            <Separator className="bg-border" />
            <Card className="bg-muted/30 border-border">
              <CardContent className="p-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Info className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">
                      Calendar Legend
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded border" />
                      <span className="text-muted-foreground">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-secondary rounded" />
                      <span className="text-muted-foreground">Range</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-muted rounded ring-2 ring-primary" />
                      <span className="text-muted-foreground">Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-muted rounded opacity-50" />
                      <span className="text-muted-foreground">Other month</span>
                    </div>
                    
                    {showEarnings && (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-muted-foreground">High earnings</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-secondary rounded-full" />
                          <span className="text-muted-foreground">Med earnings</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Professional Empty State */}
        {analysis.isEmpty && !isSelectingRange && (
          <Card className="bg-muted/30 border-border">
            <CardContent className="p-4 text-center">
              <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground mb-1">
                No {showRangeSelection ? 'Range' : 'Date'} Selected
              </p>
              <p className="text-xs text-muted-foreground">
                {showRangeSelection 
                  ? 'Click on the calendar to start selecting your analytics range'
                  : 'Click on any date to select it for analysis'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
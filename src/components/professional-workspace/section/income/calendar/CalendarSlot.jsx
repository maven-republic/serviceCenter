// src/components/professional-workspace/section/income/calendar/CalendarSlot.jsx
'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Circle,
  DollarSign,
  Clock,
  TrendingUp,
  Minus,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Professional utility functions using semantic tokens
const isToday = (date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const isSameDay = (date1, date2) => {
  return date1 && date2 && date1.toDateString() === date2.toDateString()
}

const isPastDate = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

const isDateInRange = (date, startDate, endDate) => {
  if (!startDate || !endDate) return false
  return date >= startDate && date <= endDate
}

const isRangeStart = (date, range) => {
  return range && range.startDate && isSameDay(date, range.startDate)
}

const isRangeEnd = (date, range) => {
  return range && range.endDate && isSameDay(date, range.endDate)
}

export default function CalendarSlot({ 
  dayInfo, 
  selectedDate,               // Single selected date
  selectedRange,              // Range selection
  onDateClick,                // Click handler
  isSelectingRange = false,   // Range selection state
  rangeStart = null,          // Range selection start
  earningsData = null,        // 🆕 UPDATED: Real earnings data { earnings: number, bookings: number }
  compact = false,            // Compact mode
  showEarnings = false,       // Show earnings indicators
  currencyService = null,     // 🆕 NEW: Currency formatting service
  hideEarnings = false        // 🆕 NEW: Privacy toggle
}) {
  const { date, isCurrentMonth, day } = dayInfo

  // Date state checks
  const isSelected = selectedDate && isSameDay(date, selectedDate)
  const inRange = selectedRange && isDateInRange(date, selectedRange.startDate, selectedRange.endDate)
  const rangeStartDay = isRangeStart(date, selectedRange)
  const rangeEndDay = isRangeEnd(date, selectedRange)
  const todayDate = isToday(date)
  const pastDate = isPastDate(date)
  const isRangeStartTemp = rangeStart && isSameDay(date, rangeStart)

  // 🆕 UPDATED: Professional earnings analysis using real data
  const hasEarnings = earningsData && earningsData.earnings > 0
  const hasBookings = earningsData && earningsData.bookings > 0
  const earningsLevel = hasEarnings ? getEarningsLevel(earningsData.earnings) : null

  // Handle click
  const handleClick = () => {
    if (isCurrentMonth && onDateClick) {
      console.log('CalendarSlot clicked:', date)
      onDateClick(date)
    }
  }

  // 🆕 UPDATED: Professional earnings level classification using dynamic thresholds
  function getEarningsLevel(amount) {
    // Dynamic thresholds based on real data context
    if (amount >= 1000) return 'high'
    if (amount >= 500) return 'medium'
    if (amount >= 100) return 'low'
    if (amount > 0) return 'minimal'
    return null
  }

  // Get professional button variant based on state
  const getButtonVariant = () => {
    // Selected states (highest priority)
    if (isSelected || rangeStartDay || rangeEndDay || isRangeStartTemp) {
      return 'default'
    }
    // Range selection
    if (inRange) {
      return 'secondary'
    }
    // Today styling (when not selected)
    if (todayDate) {
      return 'outline'
    }
    // Default
    return 'ghost'
  }

  // Professional CSS classes using semantic tokens
  const getDynamicClasses = () => {
    return cn(
      // Base professional styling
      "relative h-9 w-9 p-0 font-normal text-sm transition-all duration-200 border-border",
      compact && "h-8 w-8 text-xs",
      
      // Current month vs other month using semantic tokens
      !isCurrentMonth && "opacity-50 text-muted-foreground cursor-default bg-muted/20",
      isCurrentMonth && "cursor-pointer hover:scale-105 active:scale-95",
      
      // Past dates styling with semantic colors
      pastDate && isCurrentMonth && 
      !isSelected && !rangeStartDay && !rangeEndDay && 
      !todayDate && !isRangeStartTemp && "text-muted-foreground",
      
      // Today professional styling using semantic tokens
      todayDate && !isSelected && !rangeStartDay && !rangeEndDay && 
      !isRangeStartTemp && "ring-2 ring-primary ring-offset-1 bg-primary/5",
      
      // Range start temp selection with semantic colors
      isRangeStartTemp && "ring-2 ring-primary/50 bg-primary/10",
      
      // Professional earnings styling using semantic approach
      hasEarnings && showEarnings && isCurrentMonth && !isSelected && 
      !rangeStartDay && !rangeEndDay && !inRange && getEarningsClasses(earningsLevel),
      
      // Focus styles using semantic tokens
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    )
  }

  // Professional earnings classes using semantic tokens
  const getEarningsClasses = (level) => {
    switch (level) {
      case 'high':
        return "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
      case 'medium':
        return "bg-secondary/20 text-secondary-foreground border-secondary/30 hover:bg-secondary/30"
      case 'low':
        return "bg-muted text-muted-foreground border-border hover:bg-muted/80"
      case 'minimal':
        return "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
      default:
        return ""
    }
  }

  // Professional earnings indicator using semantic colors
  const getEarningsDotColor = () => {
    switch (earningsLevel) {
      case 'high': return 'bg-primary'
      case 'medium': return 'bg-secondary'
      case 'low': return 'bg-muted-foreground'
      case 'minimal': return 'bg-muted-foreground/50'
      default: return 'bg-muted'
    }
  }

  // Professional earnings icon based on level
  const getEarningsIcon = () => {
    switch (earningsLevel) {
      case 'high': return <DollarSign className="w-3 h-3 text-primary" />
      case 'medium': return <TrendingUp className="w-3 h-3 text-secondary-foreground" />
      case 'low': return <Circle className="w-3 h-3 text-muted-foreground" />
      case 'minimal': return <Minus className="w-3 h-3 text-muted-foreground" />
      default: return null
    }
  }

  // 🆕 UPDATED: Format earnings using currency service or fallback
  const formatEarnings = (amount) => {
    if (hideEarnings) return '••••'
    
    if (currencyService) {
      return currencyService.formatCurrency(amount)
    }
    
    // Fallback formatting
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k`
    return `${amount}`
  }

  // 🆕 UPDATED: Professional tooltip content with real data
  const getTooltipContent = () => {
    if (!isCurrentMonth) return ''
    
    const baseDate = date.toLocaleDateString()
    let details = []
    
    if (hasEarnings && !hideEarnings) {
      details.push(formatEarnings(earningsData.earnings))
    }
    
    if (hasBookings) {
      details.push(`${earningsData.bookings} booking${earningsData.bookings === 1 ? '' : 's'}`)
    }
    
    const earningsText = details.length > 0 ? ` - ${details.join(', ')}` : ''
    const statusText = todayDate ? ' (Today)' : pastDate ? ' (Past)' : ''
    
    return `${baseDate}${earningsText}${statusText}`
  }

  return (
    <div className="relative group">
      <Button
        variant={getButtonVariant()}
        size="sm"
        className={getDynamicClasses()}
        onClick={handleClick}
        disabled={!isCurrentMonth}
        title={getTooltipContent()}
      >
        {day}
        
        {/* Professional today indicator using semantic colors */}
        {todayDate && (
          <div className="absolute -top-1 -right-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse ring-1 ring-primary/20" />
          </div>
        )}
        
        {/* Professional range selection indicators */}
        {isRangeStartTemp && (
          <div className="absolute inset-0 bg-primary/10 rounded-md animate-pulse border border-primary/20" />
        )}
        
        {/* 🆕 UPDATED: Professional earnings indicator dot with real data */}
        {hasEarnings && showEarnings && isCurrentMonth && (
          <div className="absolute -bottom-1 -right-1">
            <div className={cn(
              "w-2 h-2 rounded-full border border-background shadow-sm",
              getEarningsDotColor()
            )} />
          </div>
        )}
        
        {/* 🆕 UPDATED: Professional bookings indicator (when earnings hidden) */}
        {hasBookings && hideEarnings && isCurrentMonth && (
          <div className="absolute -bottom-1 -right-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full border border-background shadow-sm" />
          </div>
        )}
        
        {/* Professional high earnings special indicator */}
        {hasEarnings && showEarnings && earningsLevel === 'high' && isCurrentMonth && (
          <div className="absolute -top-1 -left-1">
            {getEarningsIcon()}
          </div>
        )}
        
        {/* 🆕 NEW: High bookings indicator */}
        {hasBookings && earningsData.bookings >= 5 && isCurrentMonth && (
          <div className="absolute -top-1 -left-1">
            <Users className="w-3 h-3 text-blue-600" />
          </div>
        )}
      </Button>
      
      {/* Professional development badges using semantic colors */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-6 left-0 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {isSelected && (
            <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
              Selected
            </Badge>
          )}
          {rangeStartDay && (
            <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
              Start
            </Badge>
          )}
          {rangeEndDay && (
            <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
              End
            </Badge>
          )}
          {inRange && !rangeStartDay && !rangeEndDay && (
            <Badge variant="outline" className="text-xs border-border">
              Range
            </Badge>
          )}
          {hasEarnings && (
            <Badge variant="outline" className="text-xs border-border bg-primary/10">
              {earningsLevel}
            </Badge>
          )}
        </div>
      )}
      
      {/* 🆕 UPDATED: Professional earnings/bookings tooltip with real data */}
      {(hasEarnings || hasBookings) && (
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
          <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md shadow-md border border-border whitespace-nowrap">
            <div className="flex items-center gap-1">
              {hasEarnings && !hideEarnings && (
                <>
                  {getEarningsIcon()}
                  <span>{formatEarnings(earningsData.earnings)}</span>
                </>
              )}
              {hasBookings && (
                <>
                  {hasEarnings && !hideEarnings && <span className="text-muted-foreground">•</span>}
                  <Users className="w-3 h-3 text-blue-500" />
                  <span>{earningsData.bookings}</span>
                </>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {hasEarnings && !hideEarnings && (
                <span className="capitalize">{earningsLevel} earnings</span>
              )}
              {hasBookings && (
                <>
                  {hasEarnings && !hideEarnings && <span> • </span>}
                  <span>{earningsData.bookings} booking{earningsData.bookings === 1 ? '' : 's'}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Professional accessibility enhancement */}
      <span className="sr-only">
        {`${date.toLocaleDateString()}, ${
          isSelected ? 'selected' : 
          todayDate ? 'today' : 
          pastDate ? 'past date' : 'available'
        }${hasEarnings && !hideEarnings ? `, earnings: ${formatEarnings(earningsData.earnings)}` : ''
        }${hasBookings ? `, ${earningsData.bookings} booking${earningsData.bookings === 1 ? '' : 's'}` : ''}`}
      </span>
    </div>
  )
}
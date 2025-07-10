// src/components/professional-workspace/section/income/calendar/CalendarSlot.jsx
'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Circle,
  DollarSign,
  Clock,
  TrendingUp,
  Minus
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
  earningsData = null,        // Earnings amount for this date
  compact = false,            // Compact mode
  showEarnings = false        // Show earnings indicators
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

  // Professional earnings analysis
  const hasEarnings = earningsData && earningsData > 0
  const earningsLevel = hasEarnings ? getEarningsLevel(earningsData) : null

  // Handle click
  const handleClick = () => {
    if (isCurrentMonth && onDateClick) {
      console.log('CalendarSlot clicked:', date)
      onDateClick(date)
    }
  }

  // Professional earnings level classification using semantic approach
  function getEarningsLevel(amount) {
    if (amount >= 1000) return 'high'
    if (amount >= 500) return 'medium'
    if (amount >= 100) return 'low'
    return 'minimal'
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

  // Format earnings for professional display
  const formatEarnings = (amount) => {
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`
    return `$${amount}`
  }

  // Professional tooltip content
  const getTooltipContent = () => {
    if (!isCurrentMonth) return ''
    
    const baseDate = date.toLocaleDateString()
    const earningsText = hasEarnings && showEarnings ? ` - ${formatEarnings(earningsData)}` : ''
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
        
        {/* Professional earnings indicator dot */}
        {hasEarnings && showEarnings && isCurrentMonth && (
          <div className="absolute -bottom-1 -right-1">
            <div className={cn(
              "w-2 h-2 rounded-full border border-background shadow-sm",
              getEarningsDotColor()
            )} />
          </div>
        )}
        
        {/* Professional high earnings special indicator */}
        {hasEarnings && showEarnings && earningsLevel === 'high' && isCurrentMonth && (
          <div className="absolute -top-1 -left-1">
            {getEarningsIcon()}
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
        </div>
      )}
      
      {/* Professional earnings tooltip using semantic styling */}
      {hasEarnings && showEarnings && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
          <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md shadow-md border border-border whitespace-nowrap">
            <div className="flex items-center gap-1">
              {getEarningsIcon()}
              <span>{formatEarnings(earningsData)}</span>
            </div>
            <div className="text-xs text-muted-foreground capitalize">
              {earningsLevel} earnings
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
        }${hasEarnings && showEarnings ? `, earnings: ${formatEarnings(earningsData)}` : ''}`}
      </span>
    </div>
  )
}
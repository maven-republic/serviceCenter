// src/components/professional-workspace/section/income/calendar/CalendarHeader.jsx
'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Home,
  FastForward,
  Rewind,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Professional utility functions using consistent patterns
const getMonthYearDisplay = (date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })
}

const navigateMonth = (currentDate, direction) => {
  const newDate = new Date(currentDate)
  newDate.setMonth(currentDate.getMonth() + direction)
  return newDate
}

const getRelativeMonthInfo = (currentMonth) => {
  const today = new Date()
  const currentYear = today.getFullYear()
  const selectedYear = currentMonth.getFullYear()
  
  // Calculate how many months ahead/behind we are
  const monthsDiff = (selectedYear - currentYear) * 12 + (currentMonth.getMonth() - today.getMonth())
  
  return {
    isPast: monthsDiff < 0,
    isFuture: monthsDiff > 0,
    monthsDiff: Math.abs(monthsDiff),
    isCurrentMonth: monthsDiff === 0
  }
}

export default function CalendarHeader({ 
  currentMonth, 
  onMonthChange,
  compact = false,
  showTodayButton = true,
  showQuickNavigation = true,
  showRelativeInfo = true
}) {
  const handlePreviousMonth = () => {
    const newMonth = navigateMonth(currentMonth, -1)
    onMonthChange(newMonth)
  }

  const handleNextMonth = () => {
    const newMonth = navigateMonth(currentMonth, 1)
    onMonthChange(newMonth)
  }

  const handleTodayClick = () => {
    onMonthChange(new Date())
  }

  const handleYearNavigation = (direction) => {
    const newMonth = navigateMonth(currentMonth, direction * 12)
    onMonthChange(newMonth)
  }

  const relativeInfo = getRelativeMonthInfo(currentMonth)

  return (
    <div className="professional-workspace space-y-3">
      {/* Main Navigation Header */}
      <Card className="bg-card border-border">
        <CardContent className={cn("p-4", compact && "p-3")}>
          <div className="flex items-center justify-between">
            
            {/* Previous Month Navigation */}
            <div className="flex items-center gap-1">
              {showQuickNavigation && !compact && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleYearNavigation(-1)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  title="Previous year"
                >
                  <Rewind className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                variant="outline"
                size={compact ? "sm" : "default"}
                onClick={handlePreviousMonth}
                className={cn(
                  "shrink-0 bg-background hover:bg-muted border-border",
                  compact ? "h-8 w-8 p-0" : "h-9 w-9 p-0"
                )}
              >
                <ChevronLeft className={compact ? "h-3 w-3" : "h-4 w-4"} />
                <span className="sr-only">Previous month</span>
              </Button>
            </div>

            {/* Month/Year Display with Status */}
            <div className="flex items-center gap-3 min-w-0 flex-1 justify-center">
              <div className="flex items-center gap-2">
                <CalendarIcon className={cn(
                  "text-muted-foreground shrink-0",
                  compact ? "h-3 w-3" : "h-4 w-4"
                )} />
                <h3 className={cn(
                  "font-semibold text-foreground text-center min-w-0",
                  compact ? "text-sm" : "text-base"
                )}>
                  {getMonthYearDisplay(currentMonth)}
                </h3>
              </div>
              
              {/* Current Month Indicator */}
              {relativeInfo.isCurrentMonth && (
                <Badge variant="default" className="shrink-0 bg-primary text-primary-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  Current
                </Badge>
              )}
              
              {/* Today Button - only show if not current month */}
              {!relativeInfo.isCurrentMonth && showTodayButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTodayClick}
                  className={cn(
                    "shrink-0 text-xs bg-background hover:bg-muted border border-border",
                    compact ? "h-6 px-2" : "h-7 px-3"
                  )}
                >
                  <Home className="h-3 w-3 mr-1" />
                  Today
                </Button>
              )}
            </div>

            {/* Next Month Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size={compact ? "sm" : "default"}
                onClick={handleNextMonth}
                className={cn(
                  "shrink-0 bg-background hover:bg-muted border-border",
                  compact ? "h-8 w-8 p-0" : "h-9 w-9 p-0"
                )}
              >
                <ChevronRight className={compact ? "h-3 w-3" : "h-4 w-4"} />
                <span className="sr-only">Next month</span>
              </Button>
              
              {showQuickNavigation && !compact && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleYearNavigation(1)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  title="Next year"
                >
                  <FastForward className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relative Position Information */}
      {showRelativeInfo && !relativeInfo.isCurrentMonth && !compact && (
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  Navigation Status:
                </span>
              </div>
              
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs bg-background border-border",
                  relativeInfo.isPast ? "text-muted-foreground" : "text-primary"
                )}
              >
                {relativeInfo.isPast ? (
                  <>
                    {relativeInfo.monthsDiff} month{relativeInfo.monthsDiff !== 1 ? 's' : ''} ago
                  </>
                ) : (
                  <>
                    {relativeInfo.monthsDiff} month{relativeInfo.monthsDiff !== 1 ? 's' : ''} ahead
                  </>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Quick Navigation Helper */}
      {showQuickNavigation && !compact && !relativeInfo.isCurrentMonth && (
        <Card className="bg-background border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Quick jump:</span>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Previous Year */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleYearNavigation(-1)}
                  className="h-6 px-2 text-xs bg-background hover:bg-muted border border-border"
                >
                  <Rewind className="h-3 w-3 mr-1" />
                  -1y
                </Button>
                
                {/* Current Month/Year */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTodayClick}
                  className="h-6 px-3 text-xs font-medium bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary"
                >
                  <Home className="h-3 w-3 mr-1" />
                  Now
                </Button>
                
                {/* Next Year */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleYearNavigation(1)}
                  className="h-6 px-2 text-xs bg-background hover:bg-muted border border-border"
                >
                  +1y
                  <FastForward className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Context Bar */}
      {!compact && (
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Current selection</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-muted ring-2 ring-primary" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-muted" />
              <span>Available dates</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {relativeInfo.isCurrentMonth ? (
              <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
                <Clock className="h-3 w-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs border-border">
                <CalendarIcon className="h-3 w-3 mr-1" />
                Historical
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
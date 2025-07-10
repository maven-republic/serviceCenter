// src/components/professional-workspace/section/income/calendar/EndDate.jsx
'use client'

import { Calendar, ArrowLeft, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import AnalyticsCalendar from './AnalyticsCalendar'

export default function EndDate({ 
  selectedDate, 
  onDateSelect, 
  startDate = null,
  compact = false,
  showHelper = true 
}) {
  
  const handleDateSelect = (date) => {
    // Ensure end date doesn't go before start date
    if (startDate && date < startDate) {
      // If selected end date is before start date, move start date back
      onDateSelect(date, date)
    } else {
      onDateSelect(startDate, date)
    }
  }

  // Format selected date for display
  const formatSelectedDate = (date) => {
    if (!date) return null
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  // Calculate range duration
  const calculateRangeDuration = () => {
    if (!startDate || !selectedDate) return 0
    return Math.ceil((selectedDate - startDate) / (1000 * 60 * 60 * 24)) + 1
  }

  // Check if we have a valid range
  const hasValidRange = startDate && selectedDate && startDate <= selectedDate

  return (
    <Card className={cn(
      "bg-card border-border",
      compact ? "w-72" : "w-80"
    )}>
      {/* Professional Header */}
      <CardHeader className={cn(
        "bg-secondary/5 border-b border-border",
        compact ? "pb-2" : "pb-3"
      )}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            "flex items-center gap-2 text-secondary-foreground",
            compact ? "text-sm" : "text-base"
          )}>
            <Calendar className="h-4 w-4" />
            End Date
          </CardTitle>
          
          {startDate && selectedDate && (
            <Badge variant="outline" className="text-xs bg-background text-muted-foreground border-border">
              <ArrowLeft className="h-3 w-3 mr-1" />
              Range
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-4", compact ? "p-4" : "p-6")}>
        {/* Calendar Component */}
        <div className="relative">
          <AnalyticsCalendar 
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            selectedRange={null}
            onRangeSelect={null}
            showRangeSelection={false}
            showLegend={false}
            compact={true}
          />
        </div>

        {/* Selected Date Display */}
        {selectedDate && (
          <Card className="bg-muted/30 border-border">
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Selected End Date:
                  </span>
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground">
                    Active
                  </Badge>
                </div>
                <div className="font-semibold text-foreground">
                  {formatSelectedDate(selectedDate)}
                </div>
                
                {/* Range validation */}
                {startDate && selectedDate < startDate && (
                  <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20">
                    End date is before start date. Start date will be adjusted automatically.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Helper Text */}
        {showHelper && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Click a date to set as range end
            </p>
            {!selectedDate && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                Choose your ending point for the date range
              </p>
            )}
          </div>
        )}

        {/* Range Summary */}
        {hasValidRange && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">
                  Range Complete
                </span>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium text-foreground">
                    {calculateRangeDuration()} day{calculateRangeDuration() !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">From:</span>
                  <span className="font-medium text-foreground">
                    {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-medium text-foreground">
                    {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Start Date Context (when no start date selected) */}
        {!startDate && selectedDate && (
          <Card className="bg-background border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Select a start date to create a complete range</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Date Relationship Info */}
        {startDate && selectedDate && startDate > selectedDate && (
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-destructive" />
                  <span className="text-xs font-medium text-destructive">
                    Date Conflict Detected
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  The end date cannot be before the start date. 
                  The start date will be automatically adjusted to match your selection.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Range Quality Indicator */}
        {hasValidRange && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Range Quality:</span>
            <div className="flex items-center gap-1">
              {calculateRangeDuration() <= 7 ? (
                <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
                  Short-term
                </Badge>
              ) : calculateRangeDuration() <= 30 ? (
                <Badge variant="secondary" className="text-xs">
                  Medium-term
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Long-term
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
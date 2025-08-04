// src/components/professional-workspace/section/income/calendar/StartDate.jsx
'use client'

import { Calendar, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import AnalyticsCalendar from './AnalyticsCalendar'

export default function StartDate({ 
  selectedDate, 
  onDateSelect, 
  endDate = null,
  compact = false,
  showHelper = true 
}) {
  
  const handleDateSelect = (date) => {
    // Ensure start date doesn't go beyond end date
    if (endDate && date > endDate) {
      // If selected start date is after end date, move end date forward
      onDateSelect(date, date)
    } else {
      onDateSelect(date, endDate)
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

  return (
    <Card className={cn(
      "bg-card border-border",
      compact ? "w-72" : "w-80"
    )}>
      {/* Professional Header */}
      <CardHeader className={cn(
        "bg-primary/5 border-b border-border",
        compact ? "pb-2" : "pb-3"
      )}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            "flex items-center gap-2 text-primary",
            compact ? "text-sm" : "text-base"
          )}>
            <Calendar className="h-4 w-4" />
            Start Date
          </CardTitle>
          
          {selectedDate && endDate && (
            <Badge variant="outline" className="text-xs bg-background text-muted-foreground border-border">
              <ArrowRight className="h-3 w-3 mr-1" />
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
                    Selected Start Date:
                  </span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Active
                  </Badge>
                </div>
                <div className="font-semibold text-foreground">
                  {formatSelectedDate(selectedDate)}
                </div>
                
                {/* Range validation */}
                {endDate && selectedDate > endDate && (
                  <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20">
                    Start date is after end date. End date will be adjusted automatically.
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
              Click a date to set as range start
            </p>
            {!selectedDate && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                Choose your starting point for the date range
              </p>
            )}
          </div>
        )}

        {/* Date Range Context */}
        {selectedDate && endDate && selectedDate <= endDate && (
          <Card className="bg-background border-border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Range Duration:</span>
                <span className="font-medium text-foreground">
                  {Math.ceil((endDate - selectedDate) / (1000 * 60 * 60 * 24)) + 1} days
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
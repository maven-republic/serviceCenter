'use client'

import { cn } from "@/lib/utils"
import CalendarDay from './CalendarDay'
import { getDaysInMonth } from './calendarUtils'

export default function CalendarGrid({
  currentDate,
  selectedDate,
  isMobile,
  onDateSelect
}) {

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const days = getDaysInMonth(currentDate)

  const DayHeader = ({ day }) => (
    <div className="flex justify-center p-1">
      <span 
        className={cn(
          "text-xs font-medium text-muted-foreground",
          isMobile && "text-sm"
        )}
      >
        {day}
      </span>
    </div>
  )

  const WeekRow = ({ weekIndex, days }) => (
    <div key={weekIndex} className="grid grid-cols-7 gap-1">
      {Array.from({ length: 7 }, (_, dayIndex) => {
        const dayObj = days[weekIndex * 7 + dayIndex]
        if (!dayObj) {
          return <div key={dayIndex} className="p-1"></div>
        }
        
        return (
          <div key={dayIndex} className="p-1">
            <CalendarDay
              dayObj={dayObj}
              selectedDate={selectedDate}
              isMobile={isMobile}
              onDateSelect={onDateSelect}
            />
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-2">
      {/* Days of week header */}
      <div className="grid grid-cols-7">
        {daysOfWeek.map(day => (
          <DayHeader key={day} day={day} />
        ))}
      </div>

      {/* Calendar grid - 6 weeks */}
      <div className="space-y-1">
        {Array.from({ length: 6 }, (_, weekIndex) => (
          <WeekRow 
            key={weekIndex} 
            weekIndex={weekIndex} 
            days={days}
          />
        ))}
      </div>
    </div>
  )
}
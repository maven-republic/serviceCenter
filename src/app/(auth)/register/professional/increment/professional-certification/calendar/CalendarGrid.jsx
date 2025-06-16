'use client'

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
    <div className="col text-center">
      <small 
        className="text-muted calendar-mobile-day-header" 
        style={{ fontSize: isMobile ? '12px' : '11px' }}
      >
        {day}
      </small>
    </div>
  )

  const WeekRow = ({ weekIndex, days }) => (
    <div key={weekIndex} className="row g-1 mb-1">
      {Array.from({ length: 7 }, (_, dayIndex) => {
        const dayObj = days[weekIndex * 7 + dayIndex]
        if (!dayObj) {
          return <div key={dayIndex} className="col"></div>
        }
        
        return (
          <div key={dayIndex} className="col">
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
    <div>
      {/* Days of week header */}
      <div className={`row g-0 ${isMobile ? 'mb-2' : 'mb-1'}`}>
        {daysOfWeek.map(day => (
          <DayHeader key={day} day={day} />
        ))}
      </div>

      {/* Calendar grid - 6 weeks */}
      <div>
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
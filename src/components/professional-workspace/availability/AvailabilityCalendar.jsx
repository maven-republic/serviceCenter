'use client'

import { format, parse, parseISO, isValid } from 'date-fns'
import Day from './DAY'

export default function AvailabilityCalendar({ availability, overrides }) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const weekdayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDaysInMonth = (month, year) => {
    const date = new Date(year, month, 1)
    const days = []
    while (date.getMonth() === month) {
      days.push(new Date(date))
      date.setDate(date.getDate() + 1)
    }
    return days
  }

  const days = getDaysInMonth(currentMonth, currentYear)

  const getAvailabilityForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const override = overrides.find(o => o.override_date === dateStr)

    if (override) {
      return override.is_available
        ? [{ start_time: override.start_time, end_time: override.end_time }]
        : []
    }

    const weekday = format(date, 'EEEE').toLowerCase()
    return availability.filter(a => a.day_of_week === weekday)
  }

return (
  <div className="overflow-x-auto">
    <div className="min-w-[768px]">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 text-center text-sm text-muted mb-2">
        {weekdayHeaders.map((day, i) => (
          <div key={i} className="font-semibold py-2 border-b">
            {day}
          </div>
        ))}
      </div>

      {/* Day Cards */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days.map((day, i) => {
          const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
          const slots = getAvailabilityForDate(day)

          return (
            <div key={i} className="bg-white">
              <Day date={day} isToday={isToday} slots={slots} />
            </div>
          )
        })}
      </div>
    </div>
  </div>
)


}
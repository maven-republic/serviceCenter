'use client'

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay
} from 'date-fns'
import { useState } from 'react'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AvailabilityCalendarView({ availability = [], overrides = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const start = startOfWeek(startOfMonth(currentDate))
  const end = endOfWeek(endOfMonth(currentDate))

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

  const goToPreviousMonth = () => {
    setCurrentDate(prev => addDays(startOfMonth(prev), -1))
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => addDays(endOfMonth(prev), 1))
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-outline-secondary btn-sm" onClick={goToPreviousMonth}>
          ←
        </button>
        <h5 className="fw-bold mb-0">{format(currentDate, 'MMMM yyyy')}</h5>
        <button className="btn btn-outline-secondary btn-sm" onClick={goToNextMonth}>
          →
        </button>
      </div>

      <div className="row text-center border-bottom fw-semibold text-muted small mb-1">
        {weekdays.map((day, i) => (
          <div key={i} className="col px-0 py-2 border-end">{day}</div>
        ))}
      </div>

      <div className="row flex-wrap border border-light shadow-sm rounded overflow-hidden">
        {dateRange.map((date, idx) => {
          const { recurring, override } = getDayContent(date)
          const isOtherMonth = !isSameMonth(date, currentDate)
          const isToday = isSameDay(date, new Date())
          const dateKey = format(date, 'yyyy-MM-dd')

          // Color classes
          const slotClass = (slot) =>
            slot.is_available === false ? 'text-danger' :
            'text-success'

          return (
            <div
              key={idx}
              className="col-xxl-2 col-lg-2 col-md-2 col-sm-4 col-6 border p-2"
              style={{ minHeight: '110px' }}
            >
              <div className={`fw-semibold small ${isOtherMonth ? 'text-muted' : ''} ${isToday ? 'text-primary' : ''}`}>
                <time dateTime={dateKey}>{format(date, 'd')}</time>
              </div>

           <div className="mt-2">
  {override.length > 0 ? (
    <>
      {override.slice(0, 2).map((o, i) => (
        <div key={i} className={`small ${o.is_available === false ? 'text-danger' : 'text-success'}`}>
          {o.start_time}–{o.end_time} {o.is_available === false && '(Blocked)'}
        </div>
      ))}
      {override.length > 2 && (
        <div className="small text-muted">+{override.length - 2} more</div>
      )}
    </>
  ) : recurring.length > 0 ? (
    <>
      {recurring.slice(0, 2).map((r, i) => (
        <div key={i} className="small text-success d-flex align-items-center gap-1">
          <i className="fa-thin fa-repeat" title="Recurring availability" />
          <span>{r.start_time}–{r.end_time}</span>
        </div>
      ))}
      {recurring.length > 2 && (
        <div className="small text-muted">+{recurring.length - 2} more</div>
      )}
    </>
  ) : (
    <div className="text-muted small">No availability</div>
  )}
</div>

           
           
           
           
           
                      
           
           
           
           
           
           
            </div>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, isBefore, isEqual, differenceInMinutes } from 'date-fns'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'en-US': require('date-fns/locale/en-US')
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales
})

// ==== Configurable Calendly-like Rules ====
const SLOT_DURATION_MINUTES = 30
const MIN_NOTICE_HOURS = 12
const BUFFER_MINUTES = 15
const MAX_BOOKINGS_PER_DAY = 3
// ==========================================

function isOverlapping(existing, start, end) {
  return existing.some(e =>
    (start >= e.start && start < e.end) || (end > e.start && end <= e.end) || (start <= e.start && end >= e.end)
  )
}

function getStartOfDayKey(date) {
  return date.toISOString().split('T')[0] // e.g., "2025-05-15"
}

export default function AvailabilityCalendar({ availability, setAvailability }) {
  const [events, setEvents] = useState([])

  const handleSelectSlot = ({ start }) => {
    const now = new Date()
    const earliestAllowed = new Date(now.getTime() + MIN_NOTICE_HOURS * 60 * 60 * 1000)

    if (isBefore(start, earliestAllowed)) {
      alert(`Slots must be at least ${MIN_NOTICE_HOURS} hours in advance.`)
      return
    }

    const end = new Date(start.getTime() + SLOT_DURATION_MINUTES * 60000)

    if (isOverlapping(events, start, end)) {
      alert(`This time slot overlaps with an existing one.`)
      return
    }

    // Buffer check: prevent start within BUFFER_MINUTES of existing events
    const violatesBuffer = events.some(e => {
      const diffStart = Math.abs(differenceInMinutes(start, e.end))
      const diffEnd = Math.abs(differenceInMinutes(end, e.start))
      return diffStart < BUFFER_MINUTES || diffEnd < BUFFER_MINUTES
    })

    if (violatesBuffer) {
      alert(`This slot is too close to another. ${BUFFER_MINUTES} minute buffer required.`)
      return
    }

    // Daily limit
    const dayKey = getStartOfDayKey(start)
    const numToday = events.filter(e => getStartOfDayKey(e.start) === dayKey).length
    if (numToday >= MAX_BOOKINGS_PER_DAY) {
      alert(`You’ve reached the max of ${MAX_BOOKINGS_PER_DAY} slots for this day.`)
      return
    }

    const newEvent = { title: `Available`, start, end }
    setEvents([...events, newEvent])

    setAvailability(prev => [
      ...prev,
      {
        day_of_week: start.getDay(),
        start_time: format(start, 'HH:mm'),
        end_time: format(end, 'HH:mm')
      }
    ])
  }

  const handleSelectEvent = (selectedEvent) => {
    if (confirm('Remove this availability slot?')) {
      setEvents(prev => prev.filter(e => e !== selectedEvent))
      setAvailability(prev => prev.filter(slot => {
        return !(
          slot.day_of_week === selectedEvent.start.getDay() &&
          slot.start_time === format(selectedEvent.start, 'HH:mm') &&
          slot.end_time === format(selectedEvent.end, 'HH:mm')
        )
      }))
    }
  }

  return (
    <div className="my-4">
      <Calendar
        localizer={localizer}
        selectable
        views={['week']}
        defaultView="week"
        step={30}
        timeslots={1}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        events={events}
        style={{ height: 500 }}
      />
    </div>
  )
}

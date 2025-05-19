'use client'

import {
  format,
  parse,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay
} from 'date-fns'
import { useState } from 'react'
import EditAvailabilityMenu from './EditAvailabilityMenu'
import SingleDateEditorModal from './SingleDateEditorModal'
import RecurringDayEditorModal from './RecurringDayEditorModal'


const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatTime12(timeStr) {
  if (!timeStr) return ''
  const parsed = parse(timeStr, 'HH:mm', new Date())
  return format(parsed, 'h:mm a')
}

export default function AvailabilityCalendarView({
  availability = [],
  overrides = [],
  onUpdateOverride = () => {},
  onDeleteOverride = () => {},
  onUpdateRecurring = () => {}
}) 







{
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeDate, setActiveDate] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editTargetDate, setEditTargetDate] = useState(null)
  const [editingWeekdayIndex, setEditingWeekdayIndex] = useState(null)
const [showRecurringModal, setShowRecurringModal] = useState(false)


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
    setActiveDate(null)
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => addDays(endOfMonth(prev), 1))
    setActiveDate(null)
  }

  const handleDayClick = (date) => {
    setActiveDate(activeDate && format(activeDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') ? null : date)
  }

  const handleEditDate = (date) => {
    setEditTargetDate(date)
    setShowModal(true)
  }

  const handleUpdateOverride = (date, blocks) => {
  const iso = format(date, 'yyyy-MM-dd')
  const formatted = blocks.map(b => ({
  override_date: iso,
  start_time: b.start_time,
  end_time: b.end_time,
  is_available: true
}))
onUpdateOverride(iso, formatted)
    setShowModal(false)
}

  
  
  
  
  
  
  
  
  
  

  const handleResetOverride = (date) => {
    const iso = format(date, 'yyyy-MM-dd')
    onDeleteOverride(iso)
    setShowModal(false)
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-outline-secondary btn-sm" onClick={goToPreviousMonth}>←</button>
        <h5 className="fw-bold mb-0">{format(currentDate, 'MMMM yyyy')}</h5>
        <button className="btn btn-outline-secondary btn-sm" onClick={goToNextMonth}>→</button>
      </div>

      {/* Header */}
      <div className="d-none d-md-grid mb-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)', display: 'grid', gap: '1px', borderBottom: '1px solid #dee2e6' }}>
        {weekdays.map((day, i) => (
          <div key={i} className="text-center small fw-semibold text-muted py-2 border-end">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
        {dateRange.map((date, idx) => {
          const isToday = isSameDay(date, new Date())
          const isOtherMonth = !isSameMonth(date, currentDate)
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
          const dateKey = format(date, 'yyyy-MM-dd')
          const { recurring, override } = getDayContent(date)
          const showMenu = !isPast && activeDate && format(activeDate, 'yyyy-MM-dd') === dateKey

          const slotClass = (slot) =>
            slot.is_available === false ? 'text-danger' : 'text-success'

          return (
            <div
              key={idx}
              className="border bg-white p-2 position-relative"
              style={{
                minHeight: '120px',
                opacity: isPast ? 0.5 : 1,
                cursor: isPast ? 'not-allowed' : 'pointer'
              }}
              onClick={() => !isPast && handleDayClick(date)}
            >
              <div className={`fw-semibold small ${isOtherMonth ? 'text-muted' : ''} ${isToday ? 'text-primary' : ''}`}>
                <time dateTime={dateKey}>{format(date, 'd')}</time>
              </div>

              <div className="mt-2">
                {override.length > 0 ? (
                  <>
                    {override.slice(0, 2).map((o, i) => (
                      <div key={i} className={`small ${slotClass(o)}`}>
                        {formatTime12(o.start_time)}–{formatTime12(o.end_time)} {o.is_available === false && '(Blocked)'}
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
                        <i className="fas fa-repeat text-muted" title="Recurring availability" />
                        <span>{formatTime12(r.start_time)}–{formatTime12(r.end_time)}</span>
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

              {!isPast && showMenu && (
                <EditAvailabilityMenu
                  date={date}
                  onEditDate={(d) => {
                    setActiveDate(null)
                    handleEditDate(d)
                  }}
                  onEditDay={(dayIndex) => {
  setActiveDate(null)
  setEditingWeekdayIndex(dayIndex)
  setShowRecurringModal(true)
}}

                  
                  
                  
                />
              )}
            </div>
          )
        })}
      </div>

      {showModal && editTargetDate && (
  <SingleDateEditorModal
    date={editTargetDate}
    existing={overrides.filter(o => o.override_date === format(editTargetDate, 'yyyy-MM-dd'))}
    onSave={(blocks) => handleUpdateOverride(editTargetDate, blocks)}
    onReset={() => handleResetOverride(editTargetDate)}
    onClose={() => setShowModal(false)}
  />
)}


      {showRecurringModal && editingWeekdayIndex !== null && (
  <RecurringDayEditorModal
    dayIndex={editingWeekdayIndex}
    dayLabel={weekdays[editingWeekdayIndex]}
    availability={availability}
    setAvailability={onUpdateRecurring}
    onClose={() => {
      setShowRecurringModal(false)
      setEditingWeekdayIndex(null)
    }}
  />
)}

      
      
      
      
    </div>
  )
}

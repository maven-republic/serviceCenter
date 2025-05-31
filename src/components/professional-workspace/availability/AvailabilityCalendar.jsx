import { useState } from 'react'
import {
  format,
  addMonths,
  subMonths,
  addDays,
  startOfWeek,
  isSameDay,
  isSameMonth,
} from 'date-fns'

export default function AvailabilityCalendar({ availability, overrides }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeView, setActiveView] = useState('Month')

  // 🐛 DEBUG: Log what data we receive
  console.log('🎯 AvailabilityCalendar received:', {
    availability,
    availabilityLength: availability?.length,
    overrides,
    overridesLength: overrides?.length
  })

  // 🕒 Helper function to format time display
  const formatTime = (timeString) => {
    if (!timeString) return ''
    
    // Handle different time formats (HH:MM:SS or HH:MM)
    const time = timeString.split(':')
    const hours = parseInt(time[0])
    const minutes = time[1] || '00'
    
    // Convert to 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    
    return `${displayHours}:${minutes} ${ampm}`
  }

  // 📅 Enhanced function to get availability for a specific date
  const getAvailabilityForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const weekdayIndex = date.getDay() // 0 = Sunday, 1 = Monday, etc.

    console.log(`🔍 Looking for availability on ${format(date, 'EEEE')} (index: ${weekdayIndex})`)

    // Check for overrides first
    const override = overrides.find(o => o.override_date === dateStr)
    if (override) {
      console.log('📋 Found override for', dateStr)
      return override.is_available
        ? [{ start_time: override.start_time, end_time: override.end_time, isOverride: true }]
        : []
    }

    // Get regular availability based on day of week
    const matchingSlots = availability.filter(a => {
      console.log(`🔍 Checking slot: day_of_week=${a.day_of_week} (type: ${typeof a.day_of_week}) vs weekdayIndex=${weekdayIndex}`)
      
      if (typeof a.day_of_week === 'number') {
        return a.day_of_week === weekdayIndex
      }
      if (typeof a.day_of_week === 'string') {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const dayIndex = dayNames.indexOf(a.day_of_week.toLowerCase())
        return dayIndex === weekdayIndex
      }
      return false
    })

    console.log(`✅ Found ${matchingSlots.length} slots for ${format(date, 'EEEE')}:`, matchingSlots)
    return matchingSlots
  }

  const handlePrev = () => {
    if (activeView === 'Month') setCurrentDate(prev => subMonths(prev, 1))
    else setCurrentDate(prev => addDays(prev, -1 * (activeView === 'Week' ? 7 : 1)))
  }

  const handleNext = () => {
    if (activeView === 'Month') setCurrentDate(prev => addMonths(prev, 1))
    else setCurrentDate(prev => addDays(prev, activeView === 'Week' ? 7 : 1))
  }

  const handleToday = () => setCurrentDate(new Date())

  const getDaysInMonth = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const days = []
    const firstDayIndex = start.getDay()
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(start)
      d.setDate(d.getDate() - i - 1)
      days.push(d)
    }
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d))
    }
    const totalCells = Math.ceil(days.length / 7) * 7
    while (days.length < totalCells) {
      const d = new Date(days[days.length - 1])
      d.setDate(d.getDate() + 1)
      days.push(d)
    }
    return days
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 }) // Sunday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i))

  return (
    <section className="py-4">
      <div className="container-fluid px-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
          <h5 className="fw-semibold mb-0">
            {activeView === 'Day' && format(currentDate, 'EEEE, MMM d')}
            {activeView === 'Week' && `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d')}`}
            {activeView === 'Month' && format(currentDate, 'MMMM yyyy')}
          </h5>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={handleToday}>
              Today
            </button>

            <button className="btn btn-sm p-1 rounded-circle border" onClick={handlePrev}>
              ‹
            </button>

            <div className="d-none d-md-flex bg-light rounded-pill p-1 gap-1">
              {['Day', 'Week', 'Month'].map((label) => (
                <button
                  key={label}
                  className={`btn btn-sm rounded-pill px-3 fw-medium ${label === activeView ? 'bg-white text-dark' : 'text-muted'}`}
                  style={{ minWidth: '60px' }}
                  onClick={() => setActiveView(label)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="d-md-none">
              <select
                className="form-select form-select-sm"
                value={activeView}
                onChange={(e) => setActiveView(e.target.value)}
              >
                {['Day', 'Week', 'Month'].map((label) => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </div>

            <button className="btn btn-sm p-1 rounded-circle border" onClick={handleNext}>
              ›
            </button>
          </div>
        </div>

        {/* DAY VIEW */}
        {activeView === 'Day' && (
          <div className="bg-white p-3 border rounded">
            <h6 className="fw-semibold mb-2">{format(currentDate, 'EEEE, MMM d')}</h6>
            <ul className="list-unstyled">
              {getAvailabilityForDate(currentDate).map((slot, index) => (
                <li key={index} className="mb-2 p-2 rounded">
                  <span className="fw-medium text-primary">
                    {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                  </span>
                  {slot.isOverride && (
                    <span className="badge bg-warning text-dark ms-2">Override</span>
                  )}
                </li>
              ))}
              {getAvailabilityForDate(currentDate).length === 0 && (
                <li className="text-muted">No availability for this day</li>
              )}
            </ul>
          </div>
        )}

        {/* WEEK VIEW */}
        {activeView === 'Week' && (
          <div className="d-flex flex-wrap bg-white p-2 rounded border">
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, new Date())
              const slots = getAvailabilityForDate(day)
              return (
                <div
                  key={i}
                  className="border p-2 m-1 flex-grow-1"
                  style={{ minWidth: '140px', borderRadius: '4px' }}
                >
                  <div className={`fw-semibold mb-1 ${isToday ? 'text-primary' : ''}`}>
                    {format(day, 'EEE d')}
                  </div>
                  {slots.length > 0 ? (
                    slots.map((s, idx) => (
                      <div key={idx} className="text-success small mb-1 p-1 rounded">
                        {formatTime(s.start_time)} – {formatTime(s.end_time)}
                        {s.isOverride && (
                          <div className="badge bg-warning text-dark" style={{ fontSize: '0.6rem' }}>
                            Override
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-muted small">No availability</div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* MONTH VIEW - Enhanced with times */}
        {activeView === 'Month' && (
          <div className="bg-white">
            <div className="d-flex flex-wrap bg-light mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                <div
                  key={idx}
                  className="text-center py-2 text-muted fw-semibold"
                  style={{
                    width: 'calc(14.2857% - 4px)',
                    margin: '2px',
                    fontSize: '0.8rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px'
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="d-flex flex-wrap">
              {daysInMonth.map((day, i) => {
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                const inCurrentMonth = isSameMonth(day, currentDate)
                const slots = getAvailabilityForDate(day)

                return (
                  <div
                    key={i}
                    className="border p-1 d-flex flex-column align-items-start justify-content-start"
                    style={{
                      width: 'calc(14.2857% - 4px)',
                      margin: '2px',
                      minHeight: '120px', // Increased height to fit times
                      backgroundColor: inCurrentMonth ? '#fff' : '#f8f9fa',
                      borderColor: slots.length > 0 ? '#28a745' : '#dcdcdc',
                      borderWidth: slots.length > 0 ? '2px' : '0.5px',
                      borderRadius: '4px'
                    }}
                  >
                    {/* Date number */}
                    <div
                      className={`text-xs fw-semibold mb-1 d-flex align-items-center justify-content-center rounded-circle ${
                        isToday ? 'bg-primary text-white' : inCurrentMonth ? 'text-dark' : 'text-muted'
                      }`}
                      style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}
                    >
                      {day.getDate()}
                    </div>

                    {/* Time slots */}
                    {slots.length > 0 && (
                      <div className="w-100" style={{ fontSize: '0.6rem' }}>
                        {slots.slice(0, 2).map((slot, idx) => ( // Show max 2 slots to fit
                          <div
                            key={idx}
                            className="text-success fw-medium mb-1 p-1 rounded"
                            style={{ lineHeight: '1.2', fontSize: '0.6rem' }}
                          >
                            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                            {slot.isOverride && (
                              <div className="badge bg-warning" style={{ fontSize: '0.5rem' }}>
                                Override
                              </div>
                            )}
                          </div>
                        ))}
                        {slots.length > 2 && (
                          <div className="text-muted" style={{ fontSize: '0.55rem' }}>
                            +{slots.length - 2} more
                          </div>
                        )}
                      </div>
                    )}

                    {/* No availability indicator */}
                    {slots.length === 0 && inCurrentMonth && (
                      <div className="text-muted w-100 text-center mt-2" style={{ fontSize: '0.6rem' }}>
                        No times
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-3 d-flex flex-wrap gap-3 text-sm">
          <div className="d-flex align-items-center gap-1">
            <div 
              className="border border-success rounded" 
              style={{ width: '12px', height: '12px', borderWidth: '2px' }}
            ></div>
            <span className="text-muted small">Available days</span>
          </div>
          <div className="d-flex align-items-center gap-1">
            <div className="bg-warning rounded" style={{ width: '12px', height: '12px' }}></div>
            <span className="text-muted small">Override</span>
          </div>
          <div className="d-flex align-items-center gap-1">
            <div className="bg-primary rounded-circle" style={{ width: '12px', height: '12px' }}></div>
            <span className="text-muted small">Today</span>
          </div>
        </div>
      </div>
    </section>
  )
}
'use client'

import {
  format, parse, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, addDays,
  isSameMonth, isSameDay, isValid
} from 'date-fns'
import { useState } from 'react'
import EditAvailabilityMenu from './EditAvailabilityMenu'
import SingleDateEditorModal from './SingleDateEditorModal'
import RecurringDayEditorModal from './RecurringDayEditorModal'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatTime12(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') {
    console.warn('Invalid time string:', timeStr)
    return ''
  }
  
  try {
    // Handle different time formats
    let timeOnly = timeStr
    
    // If it's a full datetime string, extract just the time part
    if (timeStr.includes('T')) {
      timeOnly = timeStr.split('T')[1]?.split('.')[0] || timeStr
    }
    
    // Remove any timezone info
    timeOnly = timeOnly.split('+')[0].split('-')[0].split('Z')[0]
    
    // Ensure we have HH:MM format
    if (!timeOnly.includes(':')) {
      console.warn('Time string missing colon:', timeStr)
      return timeStr // Return as-is if we can't parse it
    }
    
    const [hours, minutes] = timeOnly.split(':').map(num => parseInt(num, 10))
    
    // Validate hours and minutes
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.warn('Invalid hours or minutes:', { hours, minutes, original: timeStr })
      return timeStr
    }
    
    // Convert to 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    const displayMinutes = minutes.toString().padStart(2, '0')
    
    return `${displayHours}:${displayMinutes} ${ampm}`
  } catch (error) {
    console.error('Error formatting time:', { timeStr, error })
    return timeStr || ''
  }
}

export default function AvailabilityCalendarView({
  availability = [],
  overrides = [],
  onUpdateOverride = () => {},
  onDeleteOverride = () => {},
  onUpdateRecurring = () => {}
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeDate, setActiveDate] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editTargetDate, setEditTargetDate] = useState(null)
  const [editingWeekdayIndex, setEditingWeekdayIndex] = useState(null)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [viewMode, setViewMode] = useState('Month') // 'Day', 'Week', or 'Month'

  // Debug logging
  console.log('🔍 Debug availability data:', availability)
  console.log('🔍 Debug overrides data:', overrides)
  
  // Check for problematic time values
  availability.forEach((item, index) => {
    if (!item.start_time || !item.end_time) {
      console.warn(`⚠️ Availability item ${index} has missing times:`, item)
    }
  })
  
  overrides.forEach((item, index) => {
    if (!item.start_time || !item.end_time) {
      console.warn(`⚠️ Override item ${index} has missing times:`, item)
    }
  })

  const start = viewMode === 'Month' 
    ? startOfWeek(startOfMonth(currentDate)) 
    : viewMode === 'Week'
    ? startOfWeek(currentDate)
    : currentDate
    
  const end = viewMode === 'Month' 
    ? endOfWeek(endOfMonth(currentDate)) 
    : viewMode === 'Week'
    ? endOfWeek(currentDate)
    : currentDate

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
    if (viewMode === 'Month') {
      setCurrentDate(prev => addDays(startOfMonth(prev), -1))
    } else if (viewMode === 'Week') {
      setCurrentDate(prev => addDays(prev, -7))
    } else {
      setCurrentDate(prev => addDays(prev, -1))
    }
    setActiveDate(null)
  }

  const goToNextMonth = () => {
    if (viewMode === 'Month') {
      setCurrentDate(prev => addDays(endOfMonth(prev), 1))
    } else if (viewMode === 'Week') {
      setCurrentDate(prev => addDays(prev, 7))
    } else {
      setCurrentDate(prev => addDays(prev, 1))
    }
    setActiveDate(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
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
    <div className="container-fluid px-0">
      {/* Navigation Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 px-3">
        <div className="d-flex align-items-center gap-2">
          <button 
            type="button" 
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" 
            onClick={goToPreviousMonth}
          >
            <i className="fas fa-chevron-left"></i>
            <span className="d-none d-sm-inline">
              {viewMode === 'Month' ? 'Previous' : viewMode === 'Week' ? 'Previous' : 'Previous'}
            </span>
          </button>
          
          <button 
            type="button" 
            className="btn btn-outline-primary btn-sm" 
            onClick={goToToday}
          >
            Today
          </button>
          
          <button 
            type="button" 
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" 
            onClick={goToNextMonth}
          >
            <span className="d-none d-sm-inline">
              {viewMode === 'Month' ? 'Next' : viewMode === 'Week' ? 'Next' : 'Next'}
            </span>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <h5 className="fw-bold mb-0 text-center">
          {viewMode === 'Month' 
            ? format(currentDate, 'MMMM yyyy')
            : viewMode === 'Week'
            ? `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
            : format(currentDate, 'EEEE, MMMM d, yyyy')
          }
        </h5>
        
        <div className="d-flex align-items-center gap-2">
          <div className="d-none d-md-flex bg-light rounded-pill p-1 gap-1">
            {['Day', 'Week', 'Month'].map((mode) => (
              <button
                key={mode}
                className={`btn btn-sm rounded-pill px-3 fw-medium ${
                  mode === viewMode ? 'bg-white text-dark shadow-sm' : 'text-muted'
                }`}
                style={{ minWidth: '70px' }}
                onClick={() => setViewMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="d-md-none">
            <select
              className="form-select form-select-sm"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
            >
              <option value="Day">Day View</option>
              <option value="Week">Week View</option>
              <option value="Month">Month View</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="calendar-container">
        {viewMode === 'Day' ? (
          // DAY VIEW - Consistent with week/month design
          <div className="day-view">
            <div className="bg-white border rounded" style={{ border: '1px solid #dee2e6' }}>
              {/* Day Header - consistent with calendar headers */}
              <div 
                className="d-flex align-items-center justify-content-between p-3 bg-light border-bottom"
                style={{ borderBottom: '1px solid #dee2e6' }}
              >
                <h6 className="fw-semibold mb-0 d-flex align-items-center gap-2">
                  <div 
                    className={`
                      fw-semibold d-flex align-items-center justify-content-center rounded-circle
                      ${isSameDay(currentDate, new Date()) ? 'bg-primary text-white' : 'bg-white border text-dark'}
                    `}
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      fontSize: '0.875rem',
                      border: isSameDay(currentDate, new Date()) ? 'none' : '1px solid #dee2e6'
                    }}
                  >
                    {format(currentDate, 'd')}
                  </div>
                  <span>{format(currentDate, 'EEEE, MMMM yyyy')}</span>
                  {isSameDay(currentDate, new Date()) && (
                    <span className="badge bg-primary ms-2">Today</span>
                  )}
                </h6>
                
                {(() => {
                  const isPast = currentDate < new Date(new Date().setHours(0, 0, 0, 0))
                  return !isPast && (
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleEditDate(currentDate)}
                    >
                      <i className="fas fa-edit me-1"></i>
                      Edit
                    </button>
                  )
                })()}
              </div>
              
              {/* Day Content */}
              <div className="p-3">
                {(() => {
                  const { recurring, override } = getDayContent(currentDate)
                  const allSlots = override.length > 0 ? override : recurring
                  const isPast = currentDate < new Date(new Date().setHours(0, 0, 0, 0))
                  
                  if (allSlots.length === 0) {
                    return (
                      <div className="text-center py-4">
                        <div className="text-muted mb-3" style={{ fontSize: '2rem' }}>
                          📅
                        </div>
                        <h6 className="text-muted mb-2">No availability set</h6>
                        <p className="text-muted small mb-3">
                          {isPast ? 'This day has passed' : 'Click to add your available hours for this day'}
                        </p>
                        {!isPast && (
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleEditDate(currentDate)}
                          >
                            <i className="fas fa-plus me-2"></i>
                            Add Hours
                          </button>
                        )}
                      </div>
                    )
                  }
                  
                  return (
                    <div>
                      {/* Slots grid - horizontal layout */}
                      <div className="row g-2">
                        {allSlots.map((slot, i) => (
                          <div key={i} className="col-md-6 col-lg-4">
                            <div 
                              className={`
                                d-flex flex-column p-3 border rounded h-100
                                ${slot.is_available === false ? 'border-danger bg-danger-subtle' : 'border-light bg-white'}
                              `}
                              style={{ borderColor: slot.is_available === false ? '#dc3545' : '#dee2e6' }}
                            >
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <i className={`fas ${
                                  override.length > 0 ? 'fa-calendar-check' : 'fa-repeat'
                                } ${slot.is_available === false ? 'text-danger' : 'text-muted'}`}></i>
                                
                                <span className="small text-muted">
                                  {override.length > 0 ? 'Override' : 'Regular'}
                                </span>
                                
                                {slot.is_available === false && (
                                  <span className="badge bg-danger text-white ms-auto">Blocked</span>
                                )}
                              </div>
                              
                              <div className={`
                                fw-semibold mb-1
                                ${slot.is_available === false ? 'text-danger' : 'text-dark'}
                              `} style={{ fontSize: '1rem' }}>
                                {formatTime12(slot.start_time)} – {formatTime12(slot.end_time)}
                              </div>
                              
                              <div className="small text-muted mt-auto">
                                Duration: {(() => {
                                  const start = new Date(`2000-01-01 ${slot.start_time}`)
                                  const end = new Date(`2000-01-01 ${slot.end_time}`)
                                  const diffMs = end - start
                                  const hours = Math.floor(diffMs / (1000 * 60 * 60))
                                  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                                  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
                                })()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {override.length > 0 && (
                        <div className="mt-3 p-3 bg-warning-subtle border border-warning rounded">
                          <div className="d-flex align-items-center gap-2">
                            <i className="fas fa-info-circle text-warning"></i>
                            <div className="small">
                              <span className="fw-medium text-warning-emphasis">Date Override: </span>
                              <span className="text-warning-emphasis">
                                These hours override your regular weekly schedule for this date.
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        ) : (
          // WEEK & MONTH VIEW
          <>
            {/* Weekdays Header */}
            <div 
              className="calendar-header d-none d-md-grid mb-2"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '1px',
                border: '1px solid #dee2e6',
                borderRadius: '0.375rem 0.375rem 0 0',
                overflow: 'hidden'
              }}
            >
              {weekdays.map((day, i) => (
                <div 
                  key={i} 
                  className="text-center fw-semibold text-muted py-2 bg-light"
                  style={{ 
                    fontSize: '0.875rem',
                    borderRight: i === 6 ? 'none' : '1px solid #dee2e6'
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid - Fixed 7 columns to match headers */}
            <div
              className="calendar-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '1px',
                border: viewMode === 'Month' ? '1px solid #dee2e6' : '1px solid #dee2e6',
                borderTop: viewMode === 'Month' ? 'none' : '1px solid #dee2e6',
                borderRadius: viewMode === 'Month' ? '0 0 0.375rem 0.375rem' : '0.375rem',
                overflow: 'hidden'
              }}
            >
          {dateRange.map((date, idx) => {
            const isToday = isSameDay(date, new Date())
            const isOtherMonth = viewMode === 'Month' ? !isSameMonth(date, currentDate) : false
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
            const dateKey = format(date, 'yyyy-MM-dd')
            const { recurring, override } = getDayContent(date)
            const showMenu = !isPast && activeDate && format(activeDate, 'yyyy-MM-dd') === dateKey
            const hasAvailability = recurring.length > 0 || override.length > 0

            const slotClass = (slot) =>
              slot.is_available === false ? 'text-danger' : 'text-dark'

            return (
              <div
                key={idx}
                className={`
                  calendar-day bg-white d-flex flex-column position-relative
                  ${!isPast ? 'cursor-pointer' : 'cursor-not-allowed'}
                  ${isOtherMonth ? 'opacity-60' : ''}
                  ${isPast ? 'opacity-50' : ''}
                `}
                style={{
                  minHeight: viewMode === 'Week' ? '140px' : '120px',
                  borderRight: idx % 7 === 6 ? 'none' : '1px solid #dee2e6',
                  borderBottom: Math.floor(idx / 7) === Math.floor((dateRange.length - 1) / 7) ? 'none' : '1px solid #dee2e6',
                  backgroundColor: isToday ? '#f8f9ff' : hasAvailability ? '#f8fff8' : '#ffffff'
                }}
                onClick={() => !isPast && handleDayClick(date)}
              >
                {/* Date Number */}
                <div className="p-2 pb-0">
                  <div className="d-flex flex-column align-items-center">
                    <div 
                      className={`
                        fw-semibold d-flex align-items-center justify-content-center rounded-circle
                        ${isToday ? 'bg-primary text-white' : 'bg-transparent'}
                        ${!isToday && !isOtherMonth ? 'text-dark' : ''}
                        ${isOtherMonth ? 'text-muted' : ''}
                      `}
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        fontSize: '0.875rem',
                        minWidth: '32px',
                        border: isToday ? 'none' : '1px solid transparent'
                      }}
                    >
                      <time dateTime={dateKey}>
                        {format(date, 'd')}
                      </time>
                    </div>
                    {viewMode === 'Week' && (
                      <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>
                        {format(date, 'EEE')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability Content */}
                <div className="px-2 pb-2 flex-grow-1 d-flex flex-column justify-content-start">
                  <div className="d-flex flex-column gap-1" style={{ fontSize: '0.75rem' }}>
                    {override.length > 0 ? (
                      <>
                        {override.slice(0, viewMode === 'Week' ? 5 : 2).map((o, i) => (
                          <div 
                            key={i} 
                            className={`
                              d-flex align-items-center gap-1 px-2 py-1 rounded
                              ${slotClass(o)}
                            `}
                            style={{ 
                              fontSize: viewMode === 'Week' ? '0.65rem' : '0.7rem', 
                              lineHeight: '1.3',
                              minHeight: '20px'
                            }}
                          >
                            <i className="fas fa-calendar-check" style={{ fontSize: '0.5rem', flexShrink: 0 }}></i>
                            <span className="text-truncate" style={{ lineHeight: '1.2' }}>
                              {formatTime12(o.start_time)} – {formatTime12(o.end_time)}
                              {o.is_available === false && ' (Blocked)'}
                            </span>
                          </div>
                        ))}
                        {override.length > (viewMode === 'Week' ? 5 : 2) && (
                          <div className="text-muted text-center px-1" style={{ fontSize: '0.6rem' }}>
                            +{override.length - (viewMode === 'Week' ? 5 : 2)} more
                          </div>
                        )}
                      </>
                    ) : recurring.length > 0 ? (
                      <>
                        {recurring.slice(0, viewMode === 'Week' ? 5 : 2).map((r, i) => (
                          <div 
                            key={i} 
                            className="d-flex align-items-center gap-1 text-dark px-2 py-1 rounded"
                            style={{ 
                              fontSize: viewMode === 'Week' ? '0.65rem' : '0.7rem', 
                              lineHeight: '1.3',
                              minHeight: '20px'
                            }}
                          >
                            <i className="fas fa-repeat" style={{ fontSize: '0.5rem', flexShrink: 0 }} title="Recurring"></i>
                            <span className="text-truncate" style={{ lineHeight: '1.2' }}>
                              {formatTime12(r.start_time)} – {formatTime12(r.end_time)}
                            </span>
                          </div>
                        ))}
                        {recurring.length > (viewMode === 'Week' ? 5 : 2) && (
                          <div className="text-muted text-center px-1" style={{ fontSize: '0.6rem' }}>
                            +{recurring.length - (viewMode === 'Week' ? 5 : 2)} more
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-muted text-center mt-2 px-1" style={{ fontSize: viewMode === 'Week' ? '0.65rem' : '0.7rem' }}>
                        {!isPast ? 'Click to add' : 'No availability'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Menu */}
                {showMenu && (
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

                {/* Availability Indicator Dot */}
                {hasAvailability && (
                  <div 
                    className="position-absolute"
                    style={{ top: '8px', right: '8px' }}
                  >
                    <div 
                      className={`rounded-circle ${override.length > 0 ? 'bg-warning' : 'bg-success'}`}
                      style={{ width: '6px', height: '6px' }}
                      title={override.length > 0 ? 'Has overrides' : 'Regular availability'}
                    ></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        </>
        )}
      </div>

      {/* Mobile View - Show as list on small screens */}
      <div className="d-md-none mt-4">
        <div className="row g-2">
          {dateRange.filter(date => isSameMonth(date, currentDate)).map((date, idx) => {
            const isToday = isSameDay(date, new Date())
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
            const { recurring, override } = getDayContent(date)
            const hasAvailability = recurring.length > 0 || override.length > 0

            return (
              <div key={idx} className="col-12">
                <div 
                  className={`
                    border rounded p-3 bg-white
                    ${isToday ? 'border-primary' : 'border-light'}
                    ${hasAvailability ? 'border-success' : ''}
                    ${isPast ? 'opacity-50' : ''}
                  `}
                  onClick={() => !isPast && handleDayClick(date)}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className={`mb-0 ${isToday ? 'text-primary' : ''}`}>
                      {format(date, 'EEEE, MMM d')}
                    </h6>
                    {hasAvailability && (
                      <span className={`badge ${override.length > 0 ? 'bg-warning' : 'bg-success'}`}>
                        {override.length > 0 ? 'Override' : 'Available'}
                      </span>
                    )}
                  </div>
                  
                  {/* Mobile availability display */}
                  <div className="small">
                    {override.length > 0 ? (
                      override.map((o, i) => (
                        <div key={i} className={`${o.is_available === false ? 'text-danger' : 'text-success'}`}>
                          {formatTime12(o.start_time)} – {formatTime12(o.end_time)}
                          {o.is_available === false && ' (Blocked)'}
                        </div>
                      ))
                    ) : recurring.length > 0 ? (
                      recurring.map((r, i) => (
                        <div key={i} className="text-success">
                          <i className="fas fa-repeat me-1"></i>
                          {formatTime12(r.start_time)} – {formatTime12(r.end_time)}
                        </div>
                      ))
                    ) : (
                      <div className="text-muted">No availability</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 bg-light rounded">
        <div className="row align-items-center small">
          <div className="col-md-8">
            <div className="d-flex flex-wrap gap-3">
              <div className="d-flex align-items-center gap-1">
                <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                <span>Regular hours</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <div className="bg-warning rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                <span>Date override</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <div className="border border-primary rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                <span>Today</span>
              </div>
            </div>
          </div>
          <div className="col-md-4 text-end">
            <span className="text-muted">Click any day to edit hours</span>
          </div>
        </div>
      </div>

      {/* Modals */}
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
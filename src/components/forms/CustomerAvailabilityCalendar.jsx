'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

export default function CustomerAvailabilityCalendar({ 
  professionalId, 
  onSlotSelect, 
  selectedSlot,
  className = ''
}) {
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date()) // Changed from currentWeekStart
  const [selectedDate, setSelectedDate] = useState(null)

  // Fetch available slots from API (keeping your existing logic)
  const fetchAvailableSlots = useCallback(async (startDate, endDate) => {
    if (!professionalId) {
      console.error('❌ No professionalId provided')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const url = `/api/professionals/${professionalId}/appointment-availability?start_date=${startDate}&end_date=${endDate}&slot_duration=60`
      console.log('🔍 Fetching from URL:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text()
        console.error('❌ Expected JSON but got HTML:', responseText.substring(0, 500))
        throw new Error('API returned HTML instead of JSON - check server logs')
      }

      const data = await response.json()
      console.log('✅ Received data:', data)
      console.log('✅ FULL API RESPONSE:', JSON.stringify(data, null, 2))
      
      // Additional debugging
      console.log('🕐 Current time:', new Date().toISOString())
      console.log('🕐 Jamaica time:', new Date().toLocaleString('en-US', { timeZone: 'America/Jamaica' }))
      console.log('📊 Slots by date breakdown:')
      const slotsByDateDebug = {}
      data.available_slots?.forEach(slot => {
        if (!slotsByDateDebug[slot.date]) slotsByDateDebug[slot.date] = 0
        slotsByDateDebug[slot.date]++
      })
      console.log(slotsByDateDebug)
      
      setAvailableSlots(data.available_slots || [])
    } catch (err) {
      console.error('❌ Error fetching availability:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [professionalId])

  // Load slots when component mounts or month changes
  useEffect(() => {
    // ✅ FIXED: Fetch data for the entire calendar view (6 weeks)
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    
    // Start from the first Sunday shown in calendar
    const calendarStart = new Date(firstDayOfMonth)
    calendarStart.setDate(calendarStart.getDate() - firstDayOfMonth.getDay())
    
    // End at the last Saturday shown in calendar (6 weeks later)
    const calendarEnd = new Date(calendarStart)
    calendarEnd.setDate(calendarEnd.getDate() + 41) // 6 weeks = 42 days - 1
    
    const startDateStr = formatDate(calendarStart)
    const endDateStr = formatDate(calendarEnd)
    
    console.log('📅 OLD RANGE:', formatDate(firstDayOfMonth), 'to', formatDate(lastDayOfMonth))
    console.log('📅 NEW RANGE:', startDateStr, 'to', endDateStr)
    console.log('📅 Calendar shows days from:', calendarStart.toDateString(), 'to', calendarEnd.toDateString())
    
    fetchAvailableSlots(startDateStr, endDateStr)
  }, [fetchAvailableSlots, currentMonth])

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped = {}
    console.log('🔍 RAW AVAILABLE SLOTS:', availableSlots)
    availableSlots.forEach(slot => {
      const date = slot.date
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(slot)
    })
    console.log('🔍 GROUPED SLOTS BY DATE:', grouped)
    return grouped
  }, [availableSlots])

  // Get available dates for the current month
  const availableDates = useMemo(() => {
    const dates = Object.keys(slotsByDate).filter(date => slotsByDate[date].length > 0)
    console.log('🔍 AVAILABLE DATES:', dates)
    return dates
  }, [slotsByDate])

  // Get time slots for selected date
  const timeSlotsForSelectedDate = useMemo(() => {
    return selectedDate ? slotsByDate[selectedDate] || [] : []
  }, [selectedDate, slotsByDate])

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday
    
    const days = []
    const current = new Date(startDate)
    
    // Generate 6 weeks of days (42 days)
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(current)
        const dateStr = formatDate(date)
        const isCurrentMonth = date.getMonth() === month
        const isAvailable = availableDates.includes(dateStr)
        const isTodayDate = isToday(date)
        const isPastDate = isPast(date)
        
        days.push({
          date: dateStr,
          dayNumber: date.getDate(),
          isCurrentMonth,
          isAvailable,
          isToday: isTodayDate,
          isPast: isPastDate,
          isSelected: selectedDate === dateStr,
          // ✅ DEBUG: Add debug info
          debugInfo: {
            dateStr,
            isInAvailableDates: availableDates.includes(dateStr),
            availableDatesCount: availableDates.length,
            slotsForDate: slotsByDate[dateStr]?.length || 0
          }
        })
        
        current.setDate(current.getDate() + 1)
      }
    }
    
    return days
  }, [currentMonth, availableDates, selectedDate])

  // Handle date selection
  const handleDateSelect = useCallback((dateStr, isAvailable) => {
    if (isAvailable) {
      setSelectedDate(selectedDate === dateStr ? null : dateStr)
    }
  }, [selectedDate])

  // Handle slot selection
  const handleSlotSelect = useCallback((slot) => {
    console.log('🔘 Slot selected:', slot)
    onSlotSelect?.(slot.datetime)
  }, [onSlotSelect])

  // Navigate months
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    setSelectedDate(null)
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    setSelectedDate(null)
  }, [])

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date())
    setSelectedDate(null)
  }, [])

  // Format month name for display
  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  if (loading) {
    return (
      <div className={`calendly-calendar ${className}`}>
        <div className="calendar-loading">
          <div className="loading-spinner"></div>
          <span>Loading available times...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`calendly-calendar ${className}`}>
        <div className="calendar-error">
          <span className="error-icon">⚠️</span>
          <span>Unable to load availability: {error}</span>
          <button onClick={() => {
            const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
            const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
            fetchAvailableSlots(formatDate(startOfMonth), formatDate(endOfMonth))
          }} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`calendly-calendar ${className}`}>
      {/* Two-Column Layout */}
      <div className="booking-layout">
        
        {/* Left Side - Date Picker */}
        <div className="date-picker-section">
          <div className="calendar-header">
            <div className="month-navigation">
              <button 
                onClick={goToPreviousMonth}
                className="nav-btn"
                aria-label="Previous month"
              >
                ‹
              </button>
              
              <h3 className="month-title">{monthName}</h3>
              
              <button 
                onClick={goToNextMonth}
                className="nav-btn"
                aria-label="Next month"
              >
                ›
              </button>
            </div>
            
            <button onClick={goToToday} className="today-btn">
              Today
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            {/* Day headers */}
            <div className="day-headers">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="day-header">{day}</div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="calendar-days">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  className={`calendar-day ${
                    !day.isCurrentMonth ? 'other-month' : ''
                  } ${
                    day.isToday ? 'today' : ''
                  } ${
                    day.isPast ? 'past' : ''
                  } ${
                    day.isAvailable ? 'available' : ''
                  } ${
                    day.isSelected ? 'selected' : ''
                  }`}
                  onClick={() => handleDateSelect(day.date, day.isAvailable)}
                  disabled={day.isPast || !day.isAvailable}
                >
                  {day.dayNumber}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Time Slots */}
        <div className="time-slots-section">
          {selectedDate ? (
            <>
              <div className="selected-date-header">
                <h4>{formatSelectedDate(selectedDate)}</h4>
                <span className="slot-count">
                  {timeSlotsForSelectedDate.length} available time{timeSlotsForSelectedDate.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="time-slots-list">
                {timeSlotsForSelectedDate.map((slot, index) => (
                  <button
                    key={index}
                    className={`time-slot-btn ${selectedSlot === slot.datetime ? 'selected' : ''}`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="select-date-prompt">
              <div className="prompt-icon">📅</div>
              <h4>Select a date</h4>
              <p>Choose an available date from the calendar to see available times.</p>
            </div>
          )}
        </div>
      </div>

      {/* Assessment Info */}
      <div className="assessment-info">
        <div className="info-header">
          <span className="info-icon">ℹ️</span>
          <h6>Assessment Appointment</h6>
        </div>
        <ul className="info-list">
          <li>Professional will visit to review your project</li>
          <li>Takes measurements and discusses requirements</li>
          <li>Provides detailed quote within 24 hours</li>
          <li>Duration: Approximately 1 hour</li>
        </ul>
      </div>

      <style jsx>{`
        .calendly-calendar {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .calendar-loading, .calendar-error {
          padding: 3rem;
          text-align: center;
          color: #6b7280;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #f3f4f6;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .calendar-error {
          color: #dc2626;
        }

        .error-icon {
          display: block;
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .retry-btn {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .retry-btn:hover {
          background: #2563eb;
        }

        /* Two-Column Layout */
        .booking-layout {
          display: grid;
          grid-template-columns: 2fr 3fr;
          min-height: 400px;
        }

        /* Left Side - Date Picker */
        .date-picker-section {
          padding: 2rem;
          border-right: 1px solid #e5e7eb;
          background: white;
        }

        .calendar-header {
          margin-bottom: 2rem;
        }

        .month-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .month-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #111827;
        }

        .nav-btn {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background: transparent;
          color: #6b7280;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .nav-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .today-btn {
          display: none;
        }

        .calendar-grid {
          width: 100%;
        }

        .day-headers {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 1rem;
        }

        .day-header {
          padding: 0.75rem 0;
          text-align: center;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
        }

        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }

        .calendar-day {
          width: 40px;
          height: 40px;
          border: none;
          background: transparent;
          color: #374151;
          font-size: 16px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin: 0 auto;
        }

        .calendar-day:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .calendar-day.other-month {
          color: #d1d5db;
        }

        .calendar-day.today {
          background: #2563eb;
          color: white;
          font-weight: 600;
        }

        .calendar-day.past {
          color: #d1d5db;
          cursor: not-allowed;
        }

        .calendar-day.available {
          color: #2563eb;
          font-weight: 500;
          background: #eff6ff;
        }

        .calendar-day.available:hover {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .calendar-day.selected {
          background: #2563eb;
          color: white;
          font-weight: 600;
        }

        .calendar-day:disabled {
          cursor: not-allowed;
          opacity: 0.3;
        }

        /* Right Side - Time Slots */
        .time-slots-section {
          padding: 1.5rem;
          background: white;
        }

        .selected-date-header {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .selected-date-header h4 {
          margin: 0 0 0.5rem 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .slot-count {
          font-size: 14px;
          color: #6b7280;
        }

        .time-slots-list {
          display: grid;
          gap: 0.5rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .time-slot-btn {
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          color: #374151;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .time-slot-btn:hover {
          border-color: #3b82f6;
          background: #f0f9ff;
          transform: translateY(-1px);
        }

        .time-slot-btn.selected {
          background: #3b82f6;
          color: white;
          border-color: #2563eb;
        }

        .select-date-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: #6b7280;
        }

        .prompt-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .select-date-prompt h4 {
          margin: 0 0 0.5rem 0;
          font-size: 18px;
          font-weight: 600;
          color: #374151;
        }

        .select-date-prompt p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }

        /* Assessment Info */
        .assessment-info {
          padding: 1.5rem;
          background: #f0f9ff;
          border-top: 1px solid #e5e7eb;
        }

        .info-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .info-header h6 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #1e40af;
        }

        .info-icon {
          font-size: 16px;
        }

        .info-list {
          margin: 0;
          padding-left: 1.5rem;
          color: #374151;
        }

        .info-list li {
          font-size: 13px;
          line-height: 1.4;
          margin-bottom: 0.25rem;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .booking-layout {
            grid-template-columns: 1fr;
          }

          .date-picker-section {
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
          }

          .calendar-day {
            font-size: 12px;
          }

          .time-slots-section {
            padding: 1rem;
          }

          .time-slots-list {
            grid-template-columns: repeat(2, 1fr);
            max-height: 200px;
          }

          .time-slot-btn {
            padding: 0.5rem;
            font-size: 13px;
          }
        }

        @media (max-width: 576px) {
          .month-navigation {
            flex-direction: column;
            gap: 0.5rem;
          }

          .calendar-days {
            gap: 2px;
          }

          .time-slots-list {
            grid-template-columns: 1fr;
          }

          .assessment-info {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

// Helper functions (keeping your existing ones)
function formatDate(date) {
  return date.toISOString().split('T')[0]
}

function isToday(date) {
  const today = new Date()
  return formatDate(date) === formatDate(today)
}

function isPast(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  return checkDate < today
}

function formatSelectedDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
}
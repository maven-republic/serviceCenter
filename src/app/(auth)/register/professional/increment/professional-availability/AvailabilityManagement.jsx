'use client'

import { useState } from 'react'

const daysOfWeek = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 }
]

export default function AvailabilityManagement({ availability, setAvailability }) {
  const handleToggle = (day) => {
    const exists = availability.find(slot => slot.day_of_week === day)
    if (exists) {
      setAvailability(prev => prev.filter(slot => slot.day_of_week !== day))
    } else {
      setAvailability(prev => [
        ...prev,
        { day_of_week: day, start_time: '09:00', end_time: '17:00' }
      ])
    }
  }

  const handleTimeChange = (day, field, value) => {
    setAvailability(prev =>
      prev.map(slot =>
        slot.day_of_week === day ? { ...slot, [field]: value } : slot
      )
    )
  }

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-3">Weekly Availability</h4>
      <p className="text-muted">Select the days and hours you're generally available.</p>

      {daysOfWeek.map(({ label, value }) => {
        const slot = availability.find(a => a.day_of_week === value)
        return (
          <div key={value} className="mb-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id={`day-${value}`}
                checked={!!slot}
                onChange={() => handleToggle(value)}
              />
              <label className="form-check-label fw-semibold" htmlFor={`day-${value}`}>
                {label}
              </label>
            </div>
            {slot && (
              <div className="row mt-2">
                <div className="col">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={slot.start_time}
                    onChange={e => handleTimeChange(value, 'start_time', e.target.value)}
                  />
                </div>
                <div className="col">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={slot.end_time}
                    onChange={e => handleTimeChange(value, 'end_time', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

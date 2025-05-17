'use client'

import { useState } from 'react'
import AvailabilityBuilder from './AvailabilityBuilder'
import AvailabilityCalendarView from './AvailabilityCalendarView'

export default function AvailabilityInterface({ formData, updateFormData }) {
  const [calendarView, setCalendarView] = useState(false)

  const toggleView = () => setCalendarView(prev => !prev)

  const setAvailability = (newAvailability) => {
    updateFormData({
      target: {
        name: 'availability',
        value: newAvailability
      }
    })
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Set Your Availability</h5>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={toggleView}
        >
          {calendarView ? 'Switch to Weekly Editor' : 'Switch to Calendar View'}
        </button>
      </div>

      {calendarView ? (
        <AvailabilityCalendarView
          availability={formData.availability || []}
          overrides={formData.availabilityOverrides || []}
        />
      ) : (
        <AvailabilityBuilder
          availability={formData.availability || []}
          setAvailability={setAvailability}
        />
      )}
    </div>
  )
}

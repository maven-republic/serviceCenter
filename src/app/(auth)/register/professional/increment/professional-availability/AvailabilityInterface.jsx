'use client'

import { useState, useEffect } from 'react'
import AvailabilityBuilder from './AvailabilityBuilder'
import AvailabilityCalendarView from './AvailabilityCalendarView'

export default function AvailabilityInterface({ formData, updateFormData }) {
  const [calendarView, setCalendarView] = useState(false)

  // ✅ Add local state for override tracking
  const [overrides, setOverrides] = useState(formData.availabilityOverrides || [])

  // ✅ Sync state if formData updates externally
  useEffect(() => {
    setOverrides(formData.availabilityOverrides || [])
  }, [formData.availabilityOverrides])

  const toggleView = () => setCalendarView(prev => !prev)

  const setAvailability = (newAvailability) => {
    updateFormData({
      target: {
        name: 'availability',
        value: newAvailability
      }
    })
  }

  // ✅ Add override update handlers
  const handleUpdateOverride = (dateKey, blocks) => {
    const updated = [
      ...overrides.filter(o => o.override_date !== dateKey),
      ...blocks
    ]
    setOverrides(updated)
    updateFormData({
      target: {
        name: 'availabilityOverrides',
        value: updated
      }
    })
  }

  const handleUpdateRecurring = (newAvailability) => {
  updateFormData({
    target: {
      name: 'availability',
      value: newAvailability
    }
  })
}


  const handleDeleteOverride = (dateKey) => {
    const updated = overrides.filter(o => o.override_date !== dateKey)
    setOverrides(updated)
    updateFormData({
      target: {
        name: 'availabilityOverrides',
        value: updated
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
  overrides={overrides}
  onUpdateOverride={handleUpdateOverride}
  onDeleteOverride={handleDeleteOverride}
  onUpdateRecurring={handleUpdateRecurring}
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

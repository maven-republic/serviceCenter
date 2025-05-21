'use client'

import { useState, useEffect } from 'react'
import AvailabilityBuilder from './AvailabilityBuilder'
import AvailabilityCalendarView from './AvailabilityCalendarView'

export default function AvailabilityInterface({ formData, updateFormData }) {
  const [overrides, setOverrides] = useState(formData.availabilityOverrides || [])

  useEffect(() => {
    setOverrides(formData.availabilityOverrides || [])
  }, [formData.availabilityOverrides])

  const setAvailability = (newAvailability) => {
    updateFormData({
      target: {
        name: 'availability',
        value: newAvailability
      }
    })
  }

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
    <div className="container py-5">
      <h5 className="fw-bold mb-4">Set Your Availability</h5>

      <div className="row gx-5 gy-4">
        <div className="col-12 col-lg-6 mb-4">
          <AvailabilityBuilder
            availability={formData.availability || []}
            setAvailability={setAvailability}
          />
        </div>

        <div className="col-12 col-lg-6">
          <AvailabilityCalendarView
            availability={formData.availability || []}
            overrides={overrides}
            onUpdateOverride={handleUpdateOverride}
            onDeleteOverride={handleDeleteOverride}
            onUpdateRecurring={handleUpdateRecurring}
          />
        </div>
      </div>
    </div>
  )
}

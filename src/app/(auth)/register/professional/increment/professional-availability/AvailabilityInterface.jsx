'use client'

import AvailabilityManagement from './AvailabilityManagement'

export default function AvailabilityInterface({ formData, updateFormData }) {
  const setAvailability = (newAvailability) => {
    updateFormData({
      target: {
        name: 'availability',
        value: newAvailability
      }
    })
  }

  return (
    <AvailabilityManagement
  availability={Array.isArray(formData.availability) ? formData.availability : []}
  setAvailability={setAvailability}
/>

  )
}

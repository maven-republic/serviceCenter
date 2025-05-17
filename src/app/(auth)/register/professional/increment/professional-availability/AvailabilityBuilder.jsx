'use client'

import { useState } from 'react'
import { Button } from 'react-bootstrap'

const daysOfWeek = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 }
]

export default function AvailabilityBuilder({ availability, setAvailability }) {
  const initialState = () => {
    const map = {}
    daysOfWeek.forEach(d => {
      map[d.value] = []
    })
    return map
  }

  const [weeklySlots, setWeeklySlots] = useState(() => {
    const defaultMap = initialState()
    if (Array.isArray(availability)) {
      availability.forEach(({ day_of_week, start_time, end_time }) => {
        if (!defaultMap[day_of_week]) defaultMap[day_of_week] = []
        defaultMap[day_of_week].push({ start_time, end_time })
      })
    }
    return defaultMap
  })

  const updateAndSync = (map) => {
    setWeeklySlots(map)
    const flat = Object.entries(map).flatMap(([day, blocks]) =>
      blocks.map(b => ({
        day_of_week: parseInt(day),
        start_time: b.start_time,
        end_time: b.end_time
      }))
    )
    setAvailability(flat)
  }

  const handleAddBlock = (day) => {
    const updated = { ...weeklySlots }
    updated[day] = [...updated[day], { start_time: '09:00', end_time: '17:00' }]
    updateAndSync(updated)
  }

  const handleRemoveBlock = (day, index) => {
    const updated = { ...weeklySlots }
    updated[day] = updated[day].filter((_, i) => i !== index)
    updateAndSync(updated)
  }

  const handleTimeChange = (day, index, field, value) => {
    const updated = { ...weeklySlots }
    updated[day][index][field] = value
    updateAndSync(updated)
  }

  const handleCopyPrevious = (day) => {
    const dayIndex = parseInt(day)
    if (dayIndex === 0) return
    const updated = { ...weeklySlots }
    updated[dayIndex] = [...weeklySlots[dayIndex - 1]]
    updateAndSync(updated)
  }

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4">Set Weekly Hours</h4>

      <div className="d-flex flex-column gap-4">
        {daysOfWeek.map(({ label, value }) => {
          const blocks = weeklySlots[value] || []

          return (
            <div key={value} className="row align-items-start">
              {/* Day label on left */}
              <div className="col-md-2 col-sm-12 fw-semibold text-capitalize pt-2">
                {label}
              </div>

              {/* Time blocks on right */}
              <div className="col-md-10 col-sm-12">
                <div className="d-flex flex-column gap-2">
                  {blocks.map((block, index) => (
                    <div key={index} className="row g-2 align-items-center">
                      <div className="col-auto">
                        <input
                          type="time"
                          className="form-control"
                          value={block.start_time}
                          onChange={e => handleTimeChange(value, index, 'start_time', e.target.value)}
                        />
                      </div>
                      <div className="col-auto">
                        <span className="fw-semibold">to</span>
                      </div>
                      <div className="col-auto">
                        <input
                          type="time"
                          className="form-control"
                          value={block.end_time}
                          onChange={e => handleTimeChange(value, index, 'end_time', e.target.value)}
                        />
                      </div>

                      {/* Control buttons */}
                      
                      <div className="col-auto d-flex gap-2 align-items-center">
  {/* Remove Button */}
  <div
    role="button"
    onClick={() => handleRemoveBlock(value, index)}
    className="d-flex align-items-center justify-content-center border rounded-circle bg-white shadow-sm"
    style={{ width: '30px', height: '30px', cursor: 'pointer' }}
    title="Remove"
  >
    <span className="text-danger fw-bold">✕</span>
  </div>

  {/* Only show add/copy on first block */}
  {index === 0 && (
    <>
      <div
        role="button"
        onClick={() => handleAddBlock(value)}
        className="d-flex align-items-center justify-content-center border rounded-circle bg-white shadow-sm"
        style={{ width: '30px', height: '30px', cursor: 'pointer' }}
        title="Add block"
      >
        <span className="text-primary fw-bold">+</span>
      </div>

      {value !== 0 && (
        <div
          role="button"
          onClick={() => handleCopyPrevious(value)}
          className="d-flex align-items-center justify-content-center border rounded-circle bg-white shadow-sm"
          style={{ width: '30px', height: '30px', cursor: 'pointer' }}
          title="Copy previous day"
        >
          <span className="text-secondary">📋</span>
        </div>
      )}
    </>
  )}
</div>

                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                    </div>
                  ))}

                  {blocks.length === 0 && (
  <div
    role="button"
    onClick={() => handleAddBlock(value)}
    className="d-flex align-items-center justify-content-center border rounded-circle bg-white shadow-sm"
    style={{ width: '40px', height: '40px', cursor: 'pointer' }}
    title="Add hours"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="text-primary" viewBox="0 0 24 24">
      <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
)}

                  
                  
                  
                  
                  
                  
                  
                  
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

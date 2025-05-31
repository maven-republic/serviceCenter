'use client'

import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { AVAILABILITY_RULES } from '@/config/availabilityRules'

const daysOfWeek = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 }
]

function hasDuplicateBlock(blocks) {
  const seen = new Set()
  for (const block of blocks) {
    const key = `${block.start_time}-${block.end_time}`
    if (seen.has(key)) return true
    seen.add(key)
  }
  return false
}

function generateNextTimeBlock(existingBlocks, increment = 60) {
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const toTime = (m) => {
    const h = Math.floor(m / 60)
    const mins = m % 60
    return `${h.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  if (!existingBlocks.length) {
    return {
      start_time: AVAILABILITY_RULES.DEFAULT_BLOCK_START,
      end_time: AVAILABILITY_RULES.DEFAULT_BLOCK_END
    }
  }

  const sorted = [...existingBlocks].sort((a, b) => toMinutes(a.end_time) - toMinutes(b.end_time))
  const lastEnd = toMinutes(sorted[sorted.length - 1].end_time)
  const start = lastEnd
  const end = Math.min(start + increment, 1440)
  if (end <= start || end > 1440) return null

  return { start_time: toTime(start), end_time: toTime(end) }
}

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
    const next = generateNextTimeBlock(updated[day])
    if (next) {
      const candidate = [...updated[day], next]
      if (hasDuplicateBlock(candidate)) return
      updated[day] = candidate
      updateAndSync(updated)
    }
  }

  const handleRemoveBlock = (day, index) => {
    const updated = { ...weeklySlots }
    updated[day] = updated[day].filter((_, i) => i !== index)
    updateAndSync(updated)
  }

  const handleTimeChange = (day, index, field, value) => {
    const updated = { ...weeklySlots }
    updated[day][index][field] = value
    if (hasDuplicateBlock(updated[day])) return
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
    <div className="container px-0">
      <div className="mb-4">
        <h5 className="fw-bold">Set Weekly Hours</h5>
      </div>

      <div className="d-flex flex-column gap-4">
        {daysOfWeek.map(({ label, value }) => {
          const blocks = weeklySlots[value] || []
          const showDuplicateWarning = hasDuplicateBlock(blocks)

          return (
            <div
              key={value}
              className="p-3 bg-white rounded shadow-sm border d-flex flex-column gap-2"
            >
              <div className="fw-semibold text-capitalize mb-2">{label}</div>

              {blocks.map((block, index) => (
                <div key={index} className="row g-2 align-items-center">
                  <div className="col-auto">
                    <input
                      type="time"
                      className="form-control form-control-sm"
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
                      className="form-control form-control-sm"
                      value={block.end_time}
                      onChange={e => handleTimeChange(value, index, 'end_time', e.target.value)}
                    />
                  </div>

                  <div className="col-auto d-flex gap-2 align-items-center">
                    <div
                      role="button"
                      onClick={() => handleRemoveBlock(value, index)}
                      className="d-flex align-items-center justify-content-center border rounded-circle bg-white shadow-sm"
                      style={{ width: '30px', height: '30px', cursor: 'pointer' }}
                      title="Remove"
                    >
                      <span className="text-danger fw-bold">✕</span>
                    </div>

                    {index === 0 && (
                      <>
                        <div
                          role="button"
                          onClick={() => handleAddBlock(value)}
                          className="d-flex align-items-center justify-content-center border rounded-circle bg-white shadow-sm"
                          style={{ width: '30px', height: '30px', cursor: 'pointer' }}
                          title="Add time block"
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

              {showDuplicateWarning && (
                <div className="text-danger small mt-2">
                  Duplicate time block detected. Please adjust or remove.
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}


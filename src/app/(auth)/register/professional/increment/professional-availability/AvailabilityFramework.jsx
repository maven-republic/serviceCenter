'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Copy, X } from "lucide-react"
import { AVAILABILITY_RULES } from '@/config/availabilityRules'
import { cn } from "@/lib/utils"

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

export default function AvailabilityFramework({ availability, setAvailability }) {
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
    <div className="w-full max-w-md">
      <div className="mb-6">
        <h5 className="text-lg font-semibold">Set Weekly Hours</h5>
        <p className="text-sm text-muted-foreground">Define your regular availability for each day of the week.</p>
      </div>

      <div className="space-y-4">
        {daysOfWeek.map(({ label, value }) => {
          const blocks = weeklySlots[value] || []
          const showDuplicateWarning = hasDuplicateBlock(blocks)

          return (
            <div
              key={value}
              className="p-4 bg-card rounded-lg border space-y-3"
            >
              <div className="font-medium text-sm text-foreground">{label}</div>

              {blocks.map((block, index) => (
                <div key={index} className="flex items-center gap-2 flex-wrap">
                  <input
                    type="time"
                    className="px-3 py-1.5 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    value={block.start_time}
                    onChange={e => handleTimeChange(value, index, 'start_time', e.target.value)}
                  />
                  <span className="text-sm font-medium text-muted-foreground">to</span>
                  <input
                    type="time"
                    className="px-3 py-1.5 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    value={block.end_time}
                    onChange={e => handleTimeChange(value, index, 'end_time', e.target.value)}
                  />

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveBlock(value, index)}
                      className="h-8 w-8 p-0"
                      title="Remove time block"
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    {index === 0 && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddBlock(value)}
                          className="h-8 w-8 p-0"
                          title="Add time block"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>

                        {value !== 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyPrevious(value)}
                            className="h-8 w-8 p-0"
                            title="Copy previous day"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}

              {blocks.length === 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddBlock(value)}
                  className="w-full h-12 border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add hours for {label}
                </Button>
              )}

              {showDuplicateWarning && (
                <div className="text-destructive text-xs mt-2 p-2 bg-destructive/10 rounded">
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
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Copy, X } from "lucide-react"
import { AVAILABILITY_RULES } from '@/config/availabilityRules'
import { cn } from "@/lib/utils"

const daysOfWeek = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 }
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
    <div className="w-full">
      <div className="space-y-2">
        {daysOfWeek.map(({ label, value }) => {
          const blocks = weeklySlots[value] || []
          const showDuplicateWarning = hasDuplicateBlock(blocks)

          return (
            <div
              key={value}
              className="p-2 bg-card rounded border space-y-2"
            >
              <div className="font-medium text-xs text-foreground">{label}</div>

              {blocks.map((block, index) => (
                <div key={index} className="flex items-center gap-1 flex-wrap">
                  <input
                    type="time"
                    className="px-2 py-1 text-xs border border-input rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent flex-1 min-w-[70px]"
                    value={block.start_time}
                    onChange={e => handleTimeChange(value, index, 'start_time', e.target.value)}
                  />
                  <span className="text-xs font-medium text-muted-foreground">to</span>
                  <input
                    type="time"
                    className="px-2 py-1 text-xs border border-input rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent flex-1 min-w-[70px]"
                    value={block.end_time}
                    onChange={e => handleTimeChange(value, index, 'end_time', e.target.value)}
                  />

                  <div className="flex items-center gap-0.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveBlock(value, index)}
                      className="h-6 w-6 p-0"
                      title="Remove"
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
                          className="h-6 w-6 p-0"
                          title="Add time"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>

                        {value !== 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyPrevious(value)}
                            className="h-6 w-6 p-0"
                            title="Copy previous"
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
                  className="w-full h-8 border-dashed text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add hours
                </Button>
              )}

              {showDuplicateWarning && (
                <div className="text-destructive text-xs p-1 bg-destructive/10 rounded">
                  Duplicate time detected
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
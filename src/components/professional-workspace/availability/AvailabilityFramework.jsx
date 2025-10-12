'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Plus, 
  Copy, 
  Clock,
  AlertTriangle,
  Trash2,
  CopyPlus
} from 'lucide-react'
import TimeSlot from './TimeSlot'

const AVAILABILITY_RULES = {
  DEFAULT_BLOCK_START: '09:00',
  DEFAULT_BLOCK_END: '17:00'
}

const daysOfWeek = [
  { label: 'Sunday', value: 0, short: 'Sun', color: 'bg-purple-100' },
  { label: 'Monday', value: 1, short: 'Mon', color: 'bg-blue-100' },
  { label: 'Tuesday', value: 2, short: 'Tue', color: 'bg-cyan-100' },
  { label: 'Wednesday', value: 3, short: 'Wed', color: 'bg-green-100' },
  { label: 'Thursday', value: 4, short: 'Thu', color: 'bg-yellow-100' },
  { label: 'Friday', value: 5, short: 'Fri', color: 'bg-orange-100' },
  { label: 'Saturday', value: 6, short: 'Sat', color: 'bg-red-100' }
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
      start_time: AVAILABILITY_RULES?.DEFAULT_BLOCK_START || '09:00',
      end_time: AVAILABILITY_RULES?.DEFAULT_BLOCK_END || '17:00'
    }
  }

  const sorted = [...existingBlocks].sort((a, b) => toMinutes(a.end_time) - toMinutes(b.end_time))
  const lastEnd = toMinutes(sorted[sorted.length - 1].end_time)
  const start = lastEnd
  const end = Math.min(start + increment, 1440)
  if (end <= start || end > 1440) return null

  return { start_time: toTime(start), end_time: toTime(end) }
}

export default function AvailabilityFramework({ availability = [], setAvailability }) {
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

  const handleCopyToAll = (day) => {
    const updated = { ...weeklySlots }
    const sourceBlocks = [...weeklySlots[day]]
    daysOfWeek.forEach(({ value }) => {
      if (value !== day) {
        updated[value] = [...sourceBlocks]
      }
    })
    updateAndSync(updated)
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Quick Setup Presets - Mobile Optimized */}
      <Card className="border-2 border-dashed">
        <CardContent className="p-3 sm:p-4">
          <Label className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 block">Quick Setup</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const businessHours = { start_time: '09:00', end_time: '17:00' }
                const updated = { ...weeklySlots }
                for (let i = 1; i <= 5; i++) {
                  updated[i] = [businessHours]
                }
                updateAndSync(updated)
              }}
              className="h-auto py-2.5 sm:py-3 flex flex-col items-start touch-manipulation"
            >
              <div className="font-medium text-xs sm:text-sm">Mon-Fri</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">9 AM - 5 PM</div>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const extendedHours = { start_time: '08:00', end_time: '18:00' }
                const updated = { ...weeklySlots }
                for (let i = 1; i <= 6; i++) {
                  updated[i] = [extendedHours]
                }
                updateAndSync(updated)
              }}
              className="h-auto py-2.5 sm:py-3 flex flex-col items-start touch-manipulation"
            >
              <div className="font-medium text-xs sm:text-sm">Mon-Sat</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">8 AM - 6 PM</div>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const updated = initialState()
                updateAndSync(updated)
              }}
              className="h-8 sm:h-9 col-span-1 sm:col-span-2 text-destructive hover:text-destructive touch-manipulation"
            >
              <Trash2 className="h-3 w-3 mr-2" />
              <span className="text-xs sm:text-sm">Clear All Days</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Schedule - Mobile Optimized */}
      <div className="space-y-0 divide-y">
        {daysOfWeek.map(({ label, value, short, color }) => {
          const blocks = weeklySlots[value] || []
          const showDuplicateWarning = hasDuplicateBlock(blocks)
          const hasBlocks = blocks.length > 0

          return (
            <div 
              key={value} 
              className={`p-3 sm:p-4 transition-colors ${hasBlocks ? 'bg-muted/20' : ''}`}
            >
              {/* Day Header - Mobile Optimized */}
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${color} flex items-center justify-center shrink-0`}>
                    <span className="text-xs sm:text-sm font-bold">{short}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-semibold truncate">{label}</h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {blocks.length === 0 ? 'Not set' : `${blocks.length} block${blocks.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock(value)}
                  className="h-7 sm:h-8 px-2 sm:px-3 shrink-0 touch-manipulation"
                >
                  <Plus className="h-3 w-3 sm:mr-1" />
                  <span className="hidden sm:inline text-xs">Add</span>
                </Button>
              </div>

              {/* Copy Actions - Mobile Optimized */}
              {blocks.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyToAll(value)}
                    className="h-7 text-[10px] sm:text-xs justify-start sm:flex-1 touch-manipulation"
                  >
                    <CopyPlus className="h-3 w-3 mr-1.5 sm:mr-1 shrink-0" />
                    <span className="truncate">Copy to All Days</span>
                  </Button>
                  {value !== 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyPrevious(value)}
                      className="h-7 text-[10px] sm:text-xs justify-start sm:flex-1 touch-manipulation"
                    >
                      <Copy className="h-3 w-3 mr-1.5 sm:mr-1 shrink-0" />
                      <span className="truncate">Copy from {daysOfWeek[value - 1].short}</span>
                    </Button>
                  )}
                </div>
              )}

              {/* Time Blocks */}
              {blocks.length > 0 ? (
                <div className="space-y-2">
                  {blocks.map((block, index) => (
                    <TimeSlot
                      key={index}
                      block={block}
                      index={index}
                      dayValue={value}
                      onUpdate={handleTimeChange}
                      onRemove={handleRemoveBlock}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-4 text-muted-foreground">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1.5 sm:mb-2 opacity-30" />
                  <p className="text-[10px] sm:text-xs">No hours set</p>
                </div>
              )}

              {/* Duplicate Warning - Mobile Optimized */}
              {showDuplicateWarning && (
                <Alert variant="destructive" className="mt-2 sm:mt-3">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <AlertDescription className="text-[10px] sm:text-xs">
                    Duplicate times detected
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
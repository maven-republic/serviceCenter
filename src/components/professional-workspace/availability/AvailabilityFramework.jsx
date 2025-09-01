'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  X, 
  Copy, 
  Clock,
  Calendar,
  AlertTriangle,
  Info,
  Trash2
} from 'lucide-react'
import { AVAILABILITY_RULES } from '@/config/availabilityRules'

const daysOfWeek = [
  { label: 'Sunday', value: 0, short: 'Sun' },
  { label: 'Monday', value: 1, short: 'Mon' },
  { label: 'Tuesday', value: 2, short: 'Tue' },
  { label: 'Wednesday', value: 3, short: 'Wed' },
  { label: 'Thursday', value: 4, short: 'Thu' },
  { label: 'Friday', value: 5, short: 'Fri' },
  { label: 'Saturday', value: 6, short: 'Sat' }
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

  const getTotalHours = () => {
    let totalMinutes = 0
    Object.values(weeklySlots).forEach(blocks => {
      blocks.forEach(block => {
        const start = new Date(`2000-01-01 ${block.start_time}`)
        const end = new Date(`2000-01-01 ${block.end_time}`)
        totalMinutes += (end - start) / (1000 * 60)
      })
    })
    return Math.round(totalMinutes / 60 * 10) / 10
  }

  const getActiveDays = () => {
    return Object.values(weeklySlots).filter(blocks => blocks.length > 0).length
  }

  return (
    <div className="space-y-4">
      {/* Mobile Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{getTotalHours()}h</div>
              <div className="text-xs text-muted-foreground">Weekly</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{getActiveDays()}/7</div>
              <div className="text-xs text-muted-foreground">Days</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                {Object.values(weeklySlots).reduce((sum, blocks) => sum + blocks.length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Blocks</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Quick Setup */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Setup</CardTitle>
          <CardDescription className="text-sm">
            Apply common schedule templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const businessHours = { start_time: '09:00', end_time: '17:00' }
                const updated = { ...weeklySlots }
                for (let i = 1; i <= 5; i++) {
                  updated[i] = [businessHours]
                }
                updateAndSync(updated)
              }}
              className="h-12 flex flex-col items-center justify-center"
            >
              <div className="font-medium text-sm">Standard Business</div>
              <div className="text-xs text-muted-foreground">Mon-Fri, 9 AM - 5 PM</div>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const extendedHours = { start_time: '08:00', end_time: '18:00' }
                const updated = { ...weeklySlots }
                for (let i = 1; i <= 6; i++) {
                  updated[i] = [extendedHours]
                }
                updateAndSync(updated)
              }}
              className="h-12 flex flex-col items-center justify-center"
            >
              <div className="font-medium text-sm">Extended Hours</div>
              <div className="text-xs text-muted-foreground">Mon-Sat, 8 AM - 6 PM</div>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const updated = initialState()
                updateAndSync(updated)
              }}
              className="h-12 flex items-center justify-center gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="font-medium text-sm">Clear All</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Weekly Schedule - Remove Card borders around each day */}
      <div className="space-y-3">
        {daysOfWeek.map(({ label, value, short }) => {
          const blocks = weeklySlots[value] || []
          const showDuplicateWarning = hasDuplicateBlock(blocks)
          const hasBlocks = blocks.length > 0

          return (
            <div key={value} className={`p-4 ${hasBlocks ? 'bg-muted/20 rounded-lg' : ''}`}>
              <div className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                      ${hasBlocks ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                    `}>
                      {short}
                    </div>
                    <div>
                      <CardTitle className="text-base">{label}</CardTitle>
                      <CardDescription className="text-xs">
                        {blocks.length === 0 ? 'No hours set' : `${blocks.length} block${blocks.length !== 1 ? 's' : ''}`}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddBlock(value)}
                    className="h-8 px-3 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>

                {/* Mobile Action Buttons */}
                {blocks.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToAll(value)}
                      className="w-full h-9 text-xs"
                    >
                      <Copy className="h-3 w-3 mr-2" />
                      Copy to all days
                    </Button>
                    
                    {value !== 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyPrevious(value)}
                        className="w-full h-9 text-xs"
                      >
                        <Copy className="h-3 w-3 mr-2" />
                        Copy from {daysOfWeek[value - 1].label}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {/* Time Blocks */}
                {blocks.length > 0 ? (
                  <div className="space-y-3">
                    {blocks.map((block, index) => (
                      <div key={index} className="p-3 bg-card border rounded-lg space-y-3">
                        {/* Mobile Time Inputs */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor={`${value}-${index}-start`} className="text-xs font-medium">
                              Start
                            </Label>
                            <Input
                              id={`${value}-${index}-start`}
                              type="time"
                              value={block.start_time}
                              onChange={(e) => handleTimeChange(value, index, 'start_time', e.target.value)}
                              className="h-10 text-sm"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <Label htmlFor={`${value}-${index}-end`} className="text-xs font-medium">
                              End
                            </Label>
                            <Input
                              id={`${value}-${index}-end`}
                              type="time"
                              value={block.end_time}
                              onChange={(e) => handleTimeChange(value, index, 'end_time', e.target.value)}
                              className="h-10 text-sm"
                            />
                          </div>
                        </div>

                        {/* Duration and Remove */}
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {(() => {
                              const start = new Date(`2000-01-01 ${block.start_time}`)
                              const end = new Date(`2000-01-01 ${block.end_time}`)
                              const diffMs = end - start
                              const hours = Math.floor(diffMs / (1000 * 60 * 60))
                              const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                              return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
                            })()}
                          </Badge>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveBlock(value, index)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hours set</p>
                    <p className="text-xs">Tap "Add" to set hours</p>
                  </div>
                )}

                {/* Duplicate Warning */}
                {showDuplicateWarning && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Duplicate time blocks detected. Please adjust conflicting times.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile Help Section */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-blue-700">
            <Info className="h-4 w-4" />
            Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <p>• Use Quick Setup for common schedules</p>
          <p>• Copy buttons help set similar hours</p>
          <p>• Each day can have multiple time blocks</p>
          <p>• Times cannot overlap within a day</p>
        </CardContent>
      </Card>
    </div>
  )
}
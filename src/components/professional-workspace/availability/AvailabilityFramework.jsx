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
  Info
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
    return Math.round(totalMinutes / 60 * 10) / 10 // Round to 1 decimal
  }

  const getActiveDays = () => {
    return Object.values(weeklySlots).filter(blocks => blocks.length > 0).length
  }

  return (
    <div className="professional-workspace max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Weekly Schedule</h1>
        </div>
        <p className="text-muted-foreground">
          Set your regular availability for each day of the week.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weekly Hours</p>
                <p className="text-xl font-bold">{getTotalHours()}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Days</p>
                <p className="text-xl font-bold">{getActiveDays()}/7</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Blocks</p>
                <p className="text-xl font-bold">
                  {Object.values(weeklySlots).reduce((sum, blocks) => sum + blocks.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule */}
      <div className="space-y-4">
        {daysOfWeek.map(({ label, value, short }) => {
          const blocks = weeklySlots[value] || []
          const showDuplicateWarning = hasDuplicateBlock(blocks)
          const hasBlocks = blocks.length > 0

          return (
            <Card key={value} className={`transition-all duration-200 ${hasBlocks ? 'border-primary/20 bg-muted/20' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                      ${hasBlocks ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                    `}>
                      {short}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{label}</CardTitle>
                      <CardDescription>
                        {blocks.length === 0 ? 'No availability set' : `${blocks.length} time block${blocks.length !== 1 ? 's' : ''}`}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* Day Actions */}
                  <div className="flex items-center gap-2">
                    {blocks.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyToAll(value)}
                        className="h-8 px-3 text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy to all
                      </Button>
                    )}
                    
                    {value !== 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyPrevious(value)}
                        className="h-8 px-3 text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy previous
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddBlock(value)}
                      className="h-8 px-3 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add hours
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Time Blocks */}
                {blocks.length > 0 ? (
                  <div className="space-y-3">
                    {blocks.map((block, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-card border rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <Label htmlFor={`${value}-${index}-start`} className="text-sm font-medium min-w-12">
                            from:
                          </Label>
                          <Input
                            id={`${value}-${index}-start`}
                            type="time"
                            value={block.start_time}
                            onChange={(e) => handleTimeChange(value, index, 'start_time', e.target.value)}
                            className="w-32"
                          />
                          
                          
                          <Label htmlFor={`${value}-${index}-end`} className="text-sm font-medium min-w-8">
                            to:
                          </Label>
                          <Input
                            id={`${value}-${index}-end`}
                            type="time"
                            value={block.end_time}
                            onChange={(e) => handleTimeChange(value, index, 'end_time', e.target.value)}
                            className="w-32"
                          />

                          {/* Duration Display */}
                          <Badge variant="secondary" className="ml-3">
                            {(() => {
                              const start = new Date(`2000-01-01 ${block.start_time}`)
                              const end = new Date(`2000-01-01 ${block.end_time}`)
                              const diffMs = end - start
                              const hours = Math.floor(diffMs / (1000 * 60 * 60))
                              const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                              return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
                            })()}
                          </Badge>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveBlock(value, index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hours set for {label}</p>
                    <p className="text-xs">Click "Add hours" to get started</p>
                  </div>
                )}

                {/* Duplicate Warning */}
                {showDuplicateWarning && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Duplicate time block detected. Please adjust or remove conflicting times.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Setup</CardTitle>
          <CardDescription>
            Common schedule templates to get you started quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                const businessHours = { start_time: '09:00', end_time: '17:00' }
                const updated = { ...weeklySlots }
                for (let i = 1; i <= 5; i++) { // Monday to Friday
                  updated[i] = [businessHours]
                }
                updateAndSync(updated)
              }}
              className="h-auto p-4 flex flex-col items-start gap-2"
            >
              <div className="font-medium">Standard Business</div>
              <div className="text-xs text-muted-foreground">Mon-Fri, 9 AM - 5 PM</div>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const extendedHours = { start_time: '08:00', end_time: '18:00' }
                const updated = { ...weeklySlots }
                for (let i = 1; i <= 6; i++) { // Monday to Saturday
                  updated[i] = [extendedHours]
                }
                updateAndSync(updated)
              }}
              className="h-auto p-4 flex flex-col items-start gap-2"
            >
              <div className="font-medium">Extended Hours</div>
              <div className="text-xs text-muted-foreground">Mon-Sat, 8 AM - 6 PM</div>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const updated = initialState()
                updateAndSync(updated)
              }}
              className="h-auto p-4 flex flex-col items-start gap-2"
            >
              <div className="font-medium">Clear All</div>
              <div className="text-xs text-muted-foreground">Remove all time blocks</div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
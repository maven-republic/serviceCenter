'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  X, 
  Clock,
  Repeat,
  AlertTriangle,
  Copy,
  Trash2
} from 'lucide-react'

// Default rules - you might want to import these from your config
const AVAILABILITY_RULES = {
  DEFAULT_BLOCK_START: '09:00',
  DEFAULT_BLOCK_END: '17:00'
}

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

export default function RecurringDayEditorModal({ 
  isOpen = true,
  dayIndex, 
  dayLabel, 
  availability, 
  setAvailability, 
  onClose 
}) {
  const [blocks, setBlocks] = useState(
    availability.filter(a => a.day_of_week === dayIndex)
  )

  const handleChange = (index, field, value) => {
    const updated = [...blocks]
    updated[index][field] = value
    if (!hasDuplicateBlock(updated)) {
      setBlocks(updated)
    }
  }

  const handleAdd = () => {
    const next = generateNextTimeBlock(blocks)
    if (!next || hasDuplicateBlock([...blocks, next])) return
    setBlocks(prev => [...prev, next])
  }

  const handleRemove = (index) => {
    setBlocks(prev => prev.filter((_, i) => i !== index))
  }

  const handleDuplicate = (index) => {
    const blockToDuplicate = blocks[index]
    const newBlock = { ...blockToDuplicate }
    setBlocks(prev => [...prev, newBlock])
  }

  const handleApply = () => {
    const others = availability.filter(a => a.day_of_week !== dayIndex)
    const updated = [
      ...others,
      ...blocks.map(b => ({
        day_of_week: dayIndex,
        start_time: b.start_time,
        end_time: b.end_time
      }))
    ]
    setAvailability(updated)
    onClose()
  }

  const handleCancel = () => {
    // Reset to original state
    setBlocks(availability.filter(a => a.day_of_week === dayIndex))
    onClose()
  }

  const getDuration = (start, end) => {
    try {
      const startDate = new Date(`2000-01-01 ${start}`)
      const endDate = new Date(`2000-01-01 ${end}`)
      const diffMs = endDate - startDate
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
    } catch {
      return ''
    }
  }

  const getTotalHours = () => {
    let totalMinutes = 0
    blocks.forEach(block => {
      try {
        const start = new Date(`2000-01-01 ${block.start_time}`)
        const end = new Date(`2000-01-01 ${block.end_time}`)
        totalMinutes += (end - start) / (1000 * 60)
      } catch {
        // Skip invalid blocks
      }
    })
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const hasChanges = () => {
    const original = availability.filter(a => a.day_of_week === dayIndex)
    if (original.length !== blocks.length) return true
    
    return blocks.some((block, index) => {
      const orig = original[index]
      return !orig || orig.start_time !== block.start_time || orig.end_time !== block.end_time
    })
  }

  const showDuplicateWarning = hasDuplicateBlock(blocks)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
<DialogContent className="professional-workspace max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-primary" />
            Edit Weekly Hours for {dayLabel}
          </DialogTitle>
          <DialogDescription>
            Set your regular availability for every {dayLabel} of the week
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Info */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total: {getTotalHours()}</span>
            </div>
            <Badge variant="outline">
              {blocks.length} block{blocks.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Time Blocks */}
          <div className="space-y-3">
            {blocks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hours set for {dayLabel}</p>
                <p className="text-xs">Click "Add Time Block" to get started</p>
              </div>
            ) : (
              blocks.map((block, index) => (
                <div key={index} className="p-4 border rounded-lg bg-background space-y-3">
                  {/* Block Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Block {index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {getDuration(block.start_time, block.end_time)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDuplicate(index)}
                        title="Duplicate block"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleRemove(index)}
                        title="Remove block"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Time Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`start-${index}`} className="text-xs font-medium">
                        Start Time
                      </Label>
                      <Input
                        id={`start-${index}`}
                        type="time"
                        value={block.start_time}
                        onChange={(e) => handleChange(index, 'start_time', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`end-${index}`} className="text-xs font-medium">
                        End Time
                      </Label>
                      <Input
                        id={`end-${index}`}
                        type="time"
                        value={block.end_time}
                        onChange={(e) => handleChange(index, 'end_time', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Block Button */}
          <Button
            variant="outline"
            onClick={handleAdd}
            className="w-full"
            disabled={showDuplicateWarning}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Time Block
          </Button>

          {/* Duplicate Warning */}
          {showDuplicateWarning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Duplicate time blocks detected. Please adjust or remove conflicting times before saving.
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Actions */}
          {blocks.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Quick Actions</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBlocks([])}
                    className="flex-1"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const standard = {
                        start_time: '09:00',
                        end_time: '17:00'
                      }
                      setBlocks([standard])
                    }}
                    className="flex-1"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    9-5 Standard
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleApply} 
            disabled={showDuplicateWarning}
            className={hasChanges() ? '' : 'opacity-50'}
          >
            {hasChanges() ? 'Apply Changes' : 'No Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
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
  Trash2,
  Zap,
  Info
} from 'lucide-react'

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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Repeat className="h-5 w-5 text-primary" />
            Every {dayLabel}
          </DialogTitle>
          <DialogDescription className="text-base">
            Set your regular weekly hours for all {dayLabel}s. These hours repeat every week.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-sm px-3 py-1">
              <Repeat className="h-3 w-3 mr-1" />
              Weekly Pattern
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              <Clock className="h-3 w-3 mr-1" />
              {getTotalHours()}
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {blocks.length} block{blocks.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700 text-sm">
              Changes apply to every {dayLabel} going forward. Past dates are not affected.
            </AlertDescription>
          </Alert>

          <Separator />

          {/* Time Blocks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Time Blocks</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdd}
                disabled={showDuplicateWarning}
                className="h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Block
              </Button>
            </div>

            {blocks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  No hours set for {dayLabel}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Click "Add Block" above to set your availability
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdd}
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Add First Block
                </Button>
              </div>
            ) : (
              blocks.map((block, index) => (
                <div 
                  key={index} 
                  className="p-4 border-2 rounded-lg bg-background hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
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
                        onClick={() => handleDuplicate(index)}
                        className="h-7 w-7 p-0"
                        title="Duplicate"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(index)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Remove"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`start-${index}`} className="text-sm">
                        Start Time
                      </Label>
                      <Input
                        id={`start-${index}`}
                        type="time"
                        value={block.start_time}
                        onChange={(e) => handleChange(index, 'start_time', e.target.value)}
                        className="h-11 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`end-${index}`} className="text-sm">
                        End Time
                      </Label>
                      <Input
                        id={`end-${index}`}
                        type="time"
                        value={block.end_time}
                        onChange={(e) => handleChange(index, 'end_time', e.target.value)}
                        className="h-11 text-base"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Duplicate Warning */}
          {showDuplicateWarning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Duplicate time blocks detected. Remove or adjust conflicting times.
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Quick Actions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Actions</Label>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBlocks([])}
                className="h-9"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Clear All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBlocks([{
                  start_time: '09:00',
                  end_time: '17:00'
                }])}
                className="h-9"
              >
                <Zap className="h-3 w-3 mr-2" />
                9-5 Standard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBlocks([
                  { start_time: '09:00', end_time: '12:00' },
                  { start_time: '13:00', end_time: '17:00' }
                ])}
                className="h-9 col-span-2"
              >
                <Clock className="h-3 w-3 mr-2" />
                Split Shift (9-12, 1-5)
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApply} 
            disabled={showDuplicateWarning}
            className="flex-1 sm:flex-none"
          >
            {hasChanges() ? 'Apply Changes' : 'No Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
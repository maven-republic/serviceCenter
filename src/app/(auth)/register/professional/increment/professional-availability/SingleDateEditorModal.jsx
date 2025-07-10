'use client'

import { format } from 'date-fns'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, X, AlertCircle, RotateCcw } from "lucide-react"
import { AVAILABILITY_RULES } from '@/config/availabilityRules'

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

export default function SingleDateEditorModal({ 
  date, 
  existing = [], 
  onSave, 
  onReset, 
  onClose 
}) {
  const [blocks, setBlocks] = useState(
    existing.length > 0 ? existing.map(b => ({ ...b })) : [{
      start_time: AVAILABILITY_RULES.DEFAULT_BLOCK_START,
      end_time: AVAILABILITY_RULES.DEFAULT_BLOCK_END
    }]
  )

  const handleChange = (index, field, value) => {
    const updated = [...blocks]
    updated[index][field] = value
    setBlocks(updated)
  }

  const handleAdd = () => {
    const next = generateNextTimeBlock(blocks)
    if (!next || hasDuplicateBlock([...blocks, next])) return
    setBlocks(prev => [...prev, next])
  }

  const handleRemove = (index) => {
    setBlocks(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    onSave(blocks)
  }

  const isDuplicate = hasDuplicateBlock(blocks)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Edit Availability for {format(date, 'EEEE, MMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {blocks.map((block, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="time"
                className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                value={block.start_time}
                onChange={(e) => handleChange(index, 'start_time', e.target.value)}
              />
              <span className="text-sm text-muted-foreground">to</span>
              <input
                type="time"
                className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                value={block.end_time}
                onChange={(e) => handleChange(index, 'end_time', e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRemove(index)}
                className="h-9 w-9 p-0 flex-shrink-0"
                title="Remove"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={handleAdd}
            className="w-full border-dashed"
            disabled={!generateNextTimeBlock(blocks)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Time Block
          </Button>

          {existing.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Weekly Hours
            </Button>
          )}

          {isDuplicate && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Duplicate time block detected. Please adjust the times.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={isDuplicate}
          >
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
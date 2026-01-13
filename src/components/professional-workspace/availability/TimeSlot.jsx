'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import TimePicker from './TimePicker'

export default function TimeSlot({ 
  block, 
  index, 
  dayValue,
  onUpdate, 
  onRemove,
  showRemove = true 
}) {
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

  return (
    <div className="p-3 bg-background rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <Badge variant="secondary" className="text-xs">
          {getDuration(block.start_time, block.end_time)}
        </Badge>
        {showRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(dayValue, index)}
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor={`${dayValue}-${index}-start`} className="text-xs">
            Start
          </Label>
          <TimePicker
            id={`${dayValue}-${index}-start`}
            value={block.start_time}
            onChange={(value) => onUpdate(dayValue, index, 'start_time', value)}
            align="start"
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor={`${dayValue}-${index}-end`} className="text-xs">
            End
          </Label>
          <TimePicker
            id={`${dayValue}-${index}-end`}
            value={block.end_time}
            onChange={(value) => onUpdate(dayValue, index, 'end_time', value)}
            align="end"
          />
        </div>
      </div>
    </div>
  )
}
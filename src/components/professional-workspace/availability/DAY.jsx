'use client'

import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Circle,
  CheckCircle
} from 'lucide-react'

// Helper functions to replace date-fns
const formatDayAndDate = (date) => {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
  const dayNumber = date.getDate()
  return `${dayName} ${dayNumber}`
}

const formatTime12 = (timeStr) => {
  if (!timeStr) return ''
  try {
    const [hours, minutes] = timeStr.split(':')
    const hour24 = parseInt(hours, 10)
    const hour12 = hour24 % 12 || 12
    const ampm = hour24 >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minutes} ${ampm}`
  } catch {
    return timeStr
  }
}

export default function Day({ 
  date, 
  isToday = false, 
  isSelected = false,
  slots = [],
  onClick,
  className = '',
  showTimes = false,
  size = 'default' // 'sm', 'default', 'lg'
}) {
  const hasSlots = slots && slots.length > 0
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
  const dayNumber = date.getDate()

  // Size configurations
  const sizeClasses = {
    sm: 'h-16 text-xs',
    default: 'h-20 text-sm', 
    lg: 'h-24 text-base'
  }

  const handleClick = (e) => {
    e.stopPropagation()
    onClick?.(date)
  }

  return (
    <div
      className={`
        ${sizeClasses[size]}
        relative flex flex-col justify-between p-2 border rounded-lg transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-sm hover:border-primary/50' : ''}
        ${isToday ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : 'bg-background border-border'}
        ${isSelected ? 'ring-2 ring-primary bg-primary/10' : ''}
        ${hasSlots ? 'border-green-200 bg-green-50/30' : ''}
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Date Header */}
      <div className="flex items-center justify-between">
        <div className={`
          flex flex-col items-center justify-center
          ${isToday ? 'text-primary font-bold' : 'text-foreground font-medium'}
        `}>
          <div className="text-xs text-muted-foreground">{dayName}</div>
          <div className={`
            ${size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-sm' : 'text-base'}
            leading-none
          `}>
            {dayNumber}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex flex-col items-center gap-1">
          {isToday && (
            <Badge variant="default" className="text-xs px-1 py-0 h-4">
              Today
            </Badge>
          )}
          
          {hasSlots ? (
            <div className="flex items-center gap-1">
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              {size !== 'sm' && (
                <span className="text-xs text-green-600 font-medium">
                  {slots.length}
                </span>
              )}
            </div>
          ) : (
            <div className="h-2 w-2 rounded-full bg-muted" />
          )}
        </div>
      </div>

      {/* Slots Content */}
      <div className="flex-1 flex flex-col justify-center min-h-0">
        {hasSlots ? (
          <div className="space-y-1">
            {showTimes && size !== 'sm' ? (
              // Show actual times
              <>
                {slots.slice(0, size === 'lg' ? 3 : 2).map((slot, i) => (
                  <div 
                    key={i}
                    className="text-xs text-green-700 bg-green-100 px-1 py-0.5 rounded truncate"
                  >
                    {formatTime12(slot.start_time)}
                  </div>
                ))}
                {slots.length > (size === 'lg' ? 3 : 2) && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{slots.length - (size === 'lg' ? 3 : 2)} more
                  </div>
                )}
              </>
            ) : (
              // Show availability indicator
              <div className="text-center">
                <CheckCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
                <div className="text-xs text-green-600 font-medium">
                  Available
                </div>
                {size === 'lg' && (
                  <div className="text-xs text-muted-foreground">
                    {slots.length} slot{slots.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // No availability
          <div className="text-center">
            <div className="text-xs text-muted-foreground">
              {size === 'sm' ? '–' : 'No availability'}
            </div>
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      {onClick && (
        <div className="absolute inset-0 bg-primary/5 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none" />
      )}

      {/* Selection Ring */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
      )}
    </div>
  )
}

// Preset variants for common use cases
Day.Small = (props) => <Day {...props} size="sm" />
Day.Large = (props) => <Day {...props} size="lg" showTimes />
Day.Interactive = (props) => <Day {...props} onClick={props.onClick || (() => {})} />
Day.ReadOnly = (props) => <Day {...props} onClick={undefined} />
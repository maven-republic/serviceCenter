'use client'

import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Circle,
  CheckCircle2
} from 'lucide-react'

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
  variant = 'default' // 'default', 'compact', 'detailed'
}) {
  const hasSlots = slots && slots.length > 0
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
  const dayNumber = date.getDate()
  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

  // Variant configurations
  const variants = {
    compact: {
      container: 'h-14 p-1.5',
      dateSize: 'text-xs',
      slotSize: 'text-[10px]',
      maxSlots: 1
    },
    default: {
      container: 'h-20 p-2',
      dateSize: 'text-sm',
      slotSize: 'text-xs',
      maxSlots: 2
    },
    detailed: {
      container: 'h-28 p-3',
      dateSize: 'text-base',
      slotSize: 'text-xs',
      maxSlots: 3
    }
  }

  const config = variants[variant] || variants.default

  const handleClick = (e) => {
    e.stopPropagation()
    if (!isPast) {
      onClick?.(date)
    }
  }

  return (
    <button
      className={`
        ${config.container}
        relative flex flex-col justify-between border rounded-lg
        transition-all duration-200 ease-out
        ${onClick && !isPast ? 'cursor-pointer hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5 active:translate-y-0' : ''}
        ${isPast ? 'cursor-not-allowed opacity-50' : ''}
        ${isToday ? 'bg-primary/5 border-primary ring-2 ring-primary/20' : 'bg-background border-border'}
        ${isSelected ? 'ring-2 ring-primary bg-primary/10 border-primary' : ''}
        ${hasSlots && !isToday && !isSelected ? 'border-green-200 bg-green-50/30' : ''}
        ${className}
      `}
      onClick={handleClick}
      disabled={isPast}
    >
      {/* Date Header */}
      <div className="flex items-start justify-between gap-1">
        <div className={`
          flex flex-col leading-tight
          ${isToday ? 'text-primary font-bold' : 'text-foreground font-medium'}
        `}>
          <div className={`text-[10px] text-muted-foreground uppercase tracking-wide ${variant === 'compact' ? 'hidden' : ''}`}>
            {dayName}
          </div>
          <div className={`${config.dateSize} font-semibold leading-none mt-0.5`}>
            {dayNumber}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-col items-end gap-1">
          {isToday && variant !== 'compact' && (
            <Badge variant="default" className="text-[10px] px-1 py-0 h-4 leading-none">
              Today
            </Badge>
          )}
          
          {hasSlots ? (
            <div className="flex items-center gap-1">
              <Circle className="h-1.5 w-1.5 fill-green-500 text-green-500" />
              {variant === 'detailed' && (
                <span className="text-[10px] text-green-700 font-medium">
                  {slots.length}
                </span>
              )}
            </div>
          ) : (
            <Circle className="h-1.5 w-1.5 fill-muted text-muted" />
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-center min-h-0 gap-1">
        {hasSlots ? (
          <>
            {showTimes && variant !== 'compact' ? (
              // Show actual time slots
              <div className="space-y-0.5">
                {slots.slice(0, config.maxSlots).map((slot, i) => (
                  <div 
                    key={i}
                    className={`
                      ${config.slotSize} 
                      text-green-800 bg-green-100 
                      px-1.5 py-0.5 rounded 
                      truncate font-medium
                      transition-colors duration-150
                    `}
                  >
                    {formatTime12(slot.start_time)}
                  </div>
                ))}
                {slots.length > config.maxSlots && (
                  <div className="text-[10px] text-muted-foreground text-center font-medium">
                    +{slots.length - config.maxSlots}
                  </div>
                )}
              </div>
            ) : (
              // Show availability indicator
              <div className="text-center space-y-0.5">
                <CheckCircle2 className={`
                  ${variant === 'compact' ? 'h-3 w-3' : 'h-4 w-4'} 
                  text-green-600 mx-auto
                `} />
                {variant !== 'compact' && (
                  <>
                    <div className="text-[10px] text-green-700 font-medium">
                      Available
                    </div>
                    {variant === 'detailed' && (
                      <div className="text-[10px] text-muted-foreground">
                        {slots.length} slot{slots.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          // No availability
          <div className="text-center">
            <div className={`${config.slotSize} text-muted-foreground`}>
              {variant === 'compact' ? '—' : 'Unavailable'}
            </div>
          </div>
        )}
      </div>

      {/* Hover Effect Overlay */}
      {onClick && !isPast && (
        <div className="absolute inset-0 bg-primary/0 hover:bg-primary/5 transition-colors duration-200 rounded-lg pointer-events-none" />
      )}

      {/* Selection Ring */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none animate-pulse" />
      )}

      {/* Past Date Overlay */}
      {isPast && (
        <div className="absolute inset-0 bg-background/50 rounded-lg pointer-events-none" />
      )}
    </button>
  )
}

// Preset variants with proper display names
Day.Compact = function DayCompact(props) {
  return <Day {...props} variant="compact" />
}
Day.Compact.displayName = 'Day.Compact'

Day.Default = function DayDefault(props) {
  return <Day {...props} variant="default" />
}
Day.Default.displayName = 'Day.Default'

Day.Detailed = function DayDetailed(props) {
  return <Day {...props} variant="detailed" showTimes />
}
Day.Detailed.displayName = 'Day.Detailed'

Day.Interactive = function DayInteractive(props) {
  return <Day {...props} onClick={props.onClick || (() => {})} />
}
Day.Interactive.displayName = 'Day.Interactive'

Day.ReadOnly = function DayReadOnly(props) {
  return <Day {...props} onClick={undefined} />
}
Day.ReadOnly.displayName = 'Day.ReadOnly'
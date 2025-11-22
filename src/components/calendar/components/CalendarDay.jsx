import { cn } from '@/lib/utils'

export function CalendarDay({ 
  day,
  loading,
  onSelect,
  isMobile = false
}) {
  const handleClick = () => {
    if (!day.isAvailable || loading || day.isPast) return
    onSelect(day.date, day.isAvailable)
  }

  const buttonSize = isMobile ? 'h-8 w-8' : 'h-10 w-10'
  const fontSize = isMobile ? 'text-xs' : 'text-sm'

  return (
    <button
      className={cn(
        buttonSize,
        fontSize,
        "font-normal relative transition-all duration-200",
        "flex items-center justify-center rounded-md",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        !day.isCurrentMonth && "text-muted-foreground/30",
        day.isToday && !day.isSelected && "bg-accent text-accent-foreground",
        day.isPast && "text-muted-foreground/20 cursor-not-allowed hover:bg-transparent",
        day.isAvailable && !day.isPast && "font-medium cursor-pointer",
        day.isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
        loading && "cursor-not-allowed opacity-50"
      )}
      onClick={handleClick}
      disabled={loading || day.isPast || !day.isAvailable}
      aria-label={`${day.date} ${day.isAvailable ? 'available' : 'unavailable'}`}
      aria-selected={day.isSelected}
    >
      <span className="relative">
        {day.dayNumber}
        {day.isAvailable && day.slotsCount > 0 && !day.isSelected && (
          <div 
            className={cn(
              "absolute left-1/2 transform -translate-x-1/2 bg-primary rounded-full",
              isMobile 
                ? "w-0.5 h-0.5 -bottom-0.5" 
                : "w-1 h-1 -bottom-1"
            )} 
          />
        )}
      </span>
    </button>
  )
}
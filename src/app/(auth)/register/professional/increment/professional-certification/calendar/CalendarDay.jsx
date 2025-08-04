'use client'

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { isToday, isSelected } from './calendarUtils'

export default function CalendarDay({
  dayObj,
  selectedDate,
  isMobile,
  onDateSelect
}) {

  const todayCheck = isToday(dayObj.date)
  const selectedCheck = isSelected(dayObj.date, selectedDate)

  const handleClick = () => {
    onDateSelect(dayObj)
  }

  return (
    <Button
      variant={selectedCheck ? "default" : todayCheck ? "outline" : "ghost"}
      size={isMobile ? "sm" : "sm"}
      onClick={handleClick}
      className={cn(
        "w-full h-9 p-0 font-normal transition-all duration-200",
        isMobile && "h-11 text-sm",
        !isMobile && "text-xs hover:scale-105",
        !dayObj.isCurrentMonth && "opacity-40 text-muted-foreground",
        dayObj.isCurrentMonth && "hover:bg-accent hover:text-accent-foreground",
        selectedCheck && "bg-primary text-primary-foreground hover:bg-primary/90",
        todayCheck && !selectedCheck && "border-primary text-primary",
        !selectedCheck && !todayCheck && dayObj.isCurrentMonth && "hover:bg-accent"
      )}
      aria-label={`Select ${dayObj.date.toLocaleDateString()}`}
      aria-pressed={selectedCheck}
      tabIndex={dayObj.isCurrentMonth ? 0 : -1}
    >
      {dayObj.date.getDate()}
    </Button>
  )
}
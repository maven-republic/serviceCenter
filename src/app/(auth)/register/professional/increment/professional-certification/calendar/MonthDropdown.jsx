'use client'

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function MonthDropdown({
  isVisible,
  currentMonth,
  isMobile,
  months,
  onMonthChange
}) {

  if (!isVisible) return null

  const handleMonthClick = (monthIndex) => {
    onMonthChange(monthIndex)
  }

  return (
    <div 
      className={cn(
        "absolute top-full left-0 z-50 bg-popover border rounded-md shadow-lg py-1",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
        isMobile ? "min-w-36 max-h-52" : "min-w-28 max-h-48",
        "overflow-y-auto"
      )}
    >
      <div className="p-1 space-y-1">
        {months.map((month, index) => (
          <Button
            key={month}
            variant="ghost"
            size={isMobile ? "default" : "sm"}
            onClick={() => handleMonthClick(index)}
            className={cn(
              "w-full justify-start font-normal text-xs",
              isMobile && "text-sm h-11",
              index === currentMonth && "bg-accent text-accent-foreground"
            )}
          >
            {month}
          </Button>
        ))}
      </div>
    </div>
  )
}
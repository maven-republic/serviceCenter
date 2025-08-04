'use client'

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getYearRange } from './calendarUtils'

export default function YearDropdown({
  isVisible,
  currentYear,
  isMobile,
  onYearChange
}) {

  if (!isVisible) return null

  const years = getYearRange(currentYear, 50) // ±50 years from current

  const handleYearClick = (year) => {
    onYearChange(year)
  }

  return (
    <div 
      className={cn(
        "absolute top-full right-0 z-50 bg-popover border rounded-md shadow-lg py-1",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
        isMobile ? "w-24 max-h-52" : "w-20 max-h-48",
        "overflow-y-auto"
      )}
    >
      <div className="p-1 space-y-1">
        {years.map(year => (
          <Button
            key={year}
            variant="ghost"
            size={isMobile ? "default" : "sm"}
            onClick={() => handleYearClick(year)}
            className={cn(
              "w-full justify-start font-normal text-xs",
              isMobile && "text-sm h-11",
              year === currentYear && "bg-accent text-accent-foreground"
            )}
          >
            {year}
          </Button>
        ))}
      </div>
    </div>
  )
}
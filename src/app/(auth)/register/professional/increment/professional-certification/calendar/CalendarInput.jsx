'use client'

import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CalendarInput({ 
  selectedDate, 
  placeholder, 
  isMobile, 
  onClick, 
  formatDisplayDate 
}) {
  
  return (
    <div
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "cursor-pointer transition-colors",
        "hover:border-primary hover:ring-2 hover:ring-primary/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "justify-between items-center",
        isMobile && "h-12 text-base"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <span 
        className={cn(
          "flex-1",
          selectedDate ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
      </span>
      
      <Calendar 
        className={cn(
          "h-4 w-4 text-muted-foreground",
          isMobile && "h-5 w-5"
        )}
      />
    </div>
  )
}
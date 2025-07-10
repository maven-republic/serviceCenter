'use client'

import { format } from 'date-fns'
import { Calendar, Repeat } from "lucide-react"
import { cn } from "@/lib/utils"

export default function EditAvailabilityMenu({ date, onEditDate, onEditDay }) {
  const weekday = format(date, 'EEEE') // e.g. Monday

  return (
    <div
      className="absolute top-2 left-2 z-50 min-w-[160px] bg-popover border border-border rounded-md shadow-lg p-1"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onEditDate(date)
        }}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm text-left",
          "hover:bg-accent hover:text-accent-foreground transition-colors"
        )}
      >
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>Edit this date</span>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onEditDay(date.getDay())
        }}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm text-left",
          "hover:bg-accent hover:text-accent-foreground transition-colors"
        )}
      >
        <Repeat className="h-4 w-4 text-muted-foreground" />
        <span>Edit all {weekday}s</span>
      </button>
    </div>
  )
}
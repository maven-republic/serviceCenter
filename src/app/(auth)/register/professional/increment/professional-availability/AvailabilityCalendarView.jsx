'use client'

import {
  format, parse, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, addDays,
  isSameMonth, isSameDay
} from 'date-fns'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Repeat } from "lucide-react"
import { cn } from "@/lib/utils"
import EditAvailabilityMenu from './EditAvailabilityMenu'
import SingleDateEditorModal from './SingleDateEditorModal'
import RecurringDayEditorModal from './RecurringDayEditorModal'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatTime12(timeStr) {
  if (!timeStr) return ''
  const parsed = parse(timeStr, 'HH:mm', new Date())
  return format(parsed, 'h:mm a')
}

export default function AvailabilityCalendarView({
  availability = [],
  overrides = [],
  onUpdateOverride = () => {},
  onDeleteOverride = () => {},
  onUpdateRecurring = () => {}
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeDate, setActiveDate] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editTargetDate, setEditTargetDate] = useState(null)
  const [editingWeekdayIndex, setEditingWeekdayIndex] = useState(null)
  const [showRecurringModal, setShowRecurringModal] = useState(false)

  const start = startOfWeek(startOfMonth(currentDate))
  const end = endOfWeek(endOfMonth(currentDate))

  const dateRange = []
  let day = start
  while (day <= end) {
    dateRange.push(day)
    day = addDays(day, 1)
  }

  const getDayContent = (date) => {
    const dow = date.getDay()
    const iso = format(date, 'yyyy-MM-dd')
    const recurring = availability.filter(a => a.day_of_week === dow)
    const override = overrides.filter(o => o.override_date === iso)
    return { recurring, override }
  }

  const goToPreviousMonth = () => {
    setCurrentDate(prev => addDays(startOfMonth(prev), -1))
    setActiveDate(null)
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => addDays(endOfMonth(prev), 1))
    setActiveDate(null)
  }

  const handleDayClick = (date) => {
    setActiveDate(activeDate && format(activeDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') ? null : date)
  }

  const handleEditDate = (date) => {
    setEditTargetDate(date)
    setShowModal(true)
  }

  const handleUpdateOverride = (date, blocks) => {
    const iso = format(date, 'yyyy-MM-dd')
    const formatted = blocks.map(b => ({
      override_date: iso,
      start_time: b.start_time,
      end_time: b.end_time,
      is_available: true
    }))
    onUpdateOverride(iso, formatted)
    setShowModal(false)
  }

  const handleResetOverride = (date) => {
    const iso = format(date, 'yyyy-MM-dd')
    onDeleteOverride(iso)
    setShowModal(false)
  }

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h5 className="text-base font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h5>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekdays Header - FIXED: Always visible */}
      <div className="grid grid-cols-7 mb-2 border-b border-border">
        {weekdays.map((day, i) => (
          <div 
            key={i} 
            className="text-center text-xs font-semibold text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid - Enhanced for more space */}
      <div className="grid grid-cols-7 gap-2">
        {dateRange.map((date, idx) => {
          const isToday = isSameDay(date, new Date())
          const isOtherMonth = !isSameMonth(date, currentDate)
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
          const dateKey = format(date, 'yyyy-MM-dd')
          const { recurring, override } = getDayContent(date)
          const showMenu = !isPast && activeDate && format(activeDate, 'yyyy-MM-dd') === dateKey

          return (
            <div
              key={idx}
              className={cn(
                "border border-border bg-card rounded-lg p-3 flex flex-col relative cursor-pointer transition-all min-h-[110px]",
                "hover:shadow-md hover:border-primary/50",
                isPast && "opacity-50 cursor-not-allowed",
                isOtherMonth && "bg-muted/30",
                isToday && "ring-2 ring-primary ring-offset-1 bg-primary/5"
              )}
              onClick={() => !isPast && handleDayClick(date)}
            >
              {/* Date Number - Larger */}
              <div className={cn(
                "font-semibold text-sm mb-2 text-center",
                isOtherMonth && "text-muted-foreground",
                isToday && "text-primary font-bold text-base"
              )}>
                <time dateTime={dateKey}>{format(date, 'd')}</time>
              </div>

              {/* Time Slots - More readable */}
              <div className="flex flex-col gap-1 flex-1 text-center">
                {override.length > 0 ? (
                  <>
                    {override.slice(0, 2).map((o, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "text-xs px-2 py-1 rounded font-medium",
                          o.is_available === false 
                            ? "bg-destructive/10 text-destructive border border-destructive/20" 
                            : "bg-green-100 text-green-800 border border-green-200"
                        )}
                      >
                        {formatTime12(o.start_time)}
                        {o.is_available === false && " ✕"}
                      </div>
                    ))}
                    {override.length > 2 && (
                      <div className="text-xs text-muted-foreground font-medium">
                        +{override.length - 2} more
                      </div>
                    )}
                  </>
                ) : recurring.length > 0 ? (
                  <>
                    {recurring.slice(0, 2).map((r, i) => (
                      <div key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium border border-blue-200 flex items-center justify-center gap-1">
                        <Repeat className="h-3 w-3" />
                        <span>{formatTime12(r.start_time)}</span>
                      </div>
                    ))}
                    {recurring.length > 2 && (
                      <div className="text-xs text-muted-foreground font-medium">
                        +{recurring.length - 2} more
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground py-2">
                    No availability
                  </div>
                )}
              </div>

              {/* Edit Menu */}
              {showMenu && (
                <EditAvailabilityMenu
                  date={date}
                  onEditDate={(d) => {
                    setActiveDate(null)
                    handleEditDate(d)
                  }}
                  onEditDay={(dayIndex) => {
                    setActiveDate(null)
                    setEditingWeekdayIndex(dayIndex)
                    setShowRecurringModal(true)
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Modals */}
      {showModal && editTargetDate && (
        <SingleDateEditorModal
          date={editTargetDate}
          existing={overrides.filter(o => o.override_date === format(editTargetDate, 'yyyy-MM-dd'))}
          onSave={(blocks) => handleUpdateOverride(editTargetDate, blocks)}
          onReset={() => handleResetOverride(editTargetDate)}
          onClose={() => setShowModal(false)}
        />
      )}

      {showRecurringModal && editingWeekdayIndex !== null && (
        <RecurringDayEditorModal
          dayIndex={editingWeekdayIndex}
          dayLabel={weekdays[editingWeekdayIndex]}
          availability={availability}
          setAvailability={onUpdateRecurring}
          onClose={() => {
            setShowRecurringModal(false)
            setEditingWeekdayIndex(null)
          }}
        />
      )}
    </div>
  )
}
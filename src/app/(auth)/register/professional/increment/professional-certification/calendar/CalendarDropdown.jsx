'use client'

import { cn } from "@/lib/utils"
import CalendarHeader from './CalendarHeader'
import CalendarGrid from './CalendarGrid'
import CalendarFooter from './CalendarFooter'

export default function CalendarDropdown({
  selectedDate,
  currentDate,
  isMobile,
  showMonthDropdown,
  showYearDropdown,
  onDateSelect,
  onTodayClick,
  onClearClick,
  onMonthChange,
  onYearChange,
  onNavigateMonth,
  onNavigateYear,
  onToggleMonthDropdown,
  onToggleYearDropdown
}) {

  return (
    <div
      className={cn(
        "absolute z-50 bg-popover border rounded-lg shadow-lg mt-1",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
        isMobile ? "p-4 w-72 left-1/2 -translate-x-1/2" : "p-3 left-0",
        !isMobile && "w-64"
      )}
    >
      <CalendarHeader
        currentDate={currentDate}
        isMobile={isMobile}
        showMonthDropdown={showMonthDropdown}
        showYearDropdown={showYearDropdown}
        onNavigateMonth={onNavigateMonth}
        onNavigateYear={onNavigateYear}
        onMonthChange={onMonthChange}
        onYearChange={onYearChange}
        onToggleMonthDropdown={onToggleMonthDropdown}
        onToggleYearDropdown={onToggleYearDropdown}
      />

      <CalendarGrid
        currentDate={currentDate}
        selectedDate={selectedDate}
        isMobile={isMobile}
        onDateSelect={onDateSelect}
      />

      <CalendarFooter
        isMobile={isMobile}
        onTodayClick={onTodayClick}
        onClearClick={onClearClick}
      />
    </div>
  )
}
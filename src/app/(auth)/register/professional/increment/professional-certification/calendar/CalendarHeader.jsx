'use client'

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import MonthDropdown from './MonthDropdown'
import YearDropdown from './YearDropdown'

export default function CalendarHeader({
  currentDate,
  isMobile,
  showMonthDropdown,
  showYearDropdown,
  onNavigateMonth,
  onNavigateYear,
  onMonthChange,
  onYearChange,
  onToggleMonthDropdown,
  onToggleYearDropdown
}) {

  const NavigationButton = ({ direction, onClick, children, className }) => (
    <Button
      variant="ghost"
      size={isMobile ? "default" : "sm"}
      onClick={onClick}
      className={cn(
        "h-8 w-8 p-0 hover:bg-accent transition-all duration-200",
        isMobile && "h-10 w-10",
        "hover:scale-110",
        className
      )}
    >
      {children}
    </Button>
  )

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className={cn(
      "flex justify-between items-center",
      isMobile ? "mb-4" : "mb-3"
    )}>
      {/* Left Navigation */}
      <div className="flex gap-1">
        <NavigationButton 
          direction="prev-year" 
          onClick={() => onNavigateYear(-1)}
        >
          <ChevronsLeft className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
        </NavigationButton>
        
        <NavigationButton 
          direction="prev-month" 
          onClick={() => onNavigateMonth(-1)}
        >
          <ChevronLeft className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
        </NavigationButton>
      </div>

      {/* Center - Month/Year Dropdowns */}
      <div className="flex gap-1 relative">
        <div className="relative">
          <Button
            variant="ghost"
            onClick={onToggleMonthDropdown}
            className={cn(
              "font-normal text-sm hover:bg-accent transition-colors",
              isMobile && "text-base h-10 px-3",
              !isMobile && "text-xs h-8 px-2"
            )}
          >
            {months[currentDate.getMonth()]}
            <ChevronDown className={cn(
              "ml-1 h-3 w-3",
              isMobile && "h-4 w-4"
            )} />
          </Button>
          
          <MonthDropdown
            isVisible={showMonthDropdown}
            currentMonth={currentDate.getMonth()}
            isMobile={isMobile}
            months={months}
            onMonthChange={onMonthChange}
          />
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            onClick={onToggleYearDropdown}
            className={cn(
              "font-normal text-sm hover:bg-accent transition-colors",
              isMobile && "text-base h-10 px-3",
              !isMobile && "text-xs h-8 px-2"
            )}
          >
            {currentDate.getFullYear()}
            <ChevronDown className={cn(
              "ml-1 h-3 w-3",
              isMobile && "h-4 w-4"
            )} />
          </Button>
          
          <YearDropdown
            isVisible={showYearDropdown}
            currentYear={currentDate.getFullYear()}
            isMobile={isMobile}
            onYearChange={onYearChange}
          />
        </div>
      </div>

      {/* Right Navigation */}
      <div className="flex gap-1">
        <NavigationButton 
          direction="next-month" 
          onClick={() => onNavigateMonth(1)}
        >
          <ChevronRight className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
        </NavigationButton>
        
        <NavigationButton 
          direction="next-year" 
          onClick={() => onNavigateYear(1)}
        >
          <ChevronsRight className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
        </NavigationButton>
      </div>
    </div>
  )
}
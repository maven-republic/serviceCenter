'use client'

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

  const getCalendarPosition = () => {
    if (!isMobile) return { left: '0' }
    
    // On mobile, center the calendar
    return {
      left: '50%',
      transform: 'translateX(-50%)',
      width: '280px'
    }
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
          .calendar-mobile-touch {
            min-height: 44px !important;
            font-size: 14px !important;
          }
          
          .calendar-mobile-nav {
            min-height: 40px !important;
            min-width: 40px !important;
            font-size: 16px !important;
          }
          
          .calendar-mobile-header {
            font-size: 15px !important;
          }
          
          .calendar-mobile-day-header {
            font-size: 12px !important;
          }
        }
      `}</style>

      <div
        className="position-absolute bg-white border rounded-3 shadow-lg mt-1"
        style={{
          zIndex: 1000,
          padding: isMobile ? '16px' : '8px',
          animation: 'fadeIn 0.2s ease-out',
          ...getCalendarPosition()
        }}
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
    </>
  )
}
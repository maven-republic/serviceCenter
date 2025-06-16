'use client'

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

  const handleNavigationHover = (e, isEntering) => {
    if (isEntering) {
      e.target.style.transform = 'scale(1.1)'
      e.target.style.color = '#0d6efd'
    } else {
      e.target.style.transform = 'scale(1)'
      e.target.style.color = '#6c757d'
    }
  }

  const NavigationButton = ({ direction, onClick, children }) => (
    <button
      type="button"
      className={`btn btn-sm border-0 calendar-mobile-nav ${isMobile ? 'px-3 py-2' : 'px-2 py-1'}`}
      onClick={onClick}
      style={{ 
        transition: 'all 0.2s ease',
        fontSize: isMobile ? '16px' : '12px',
        color: '#6c757d',
        minHeight: isMobile ? '40px' : 'auto',
        minWidth: isMobile ? '40px' : 'auto'
      }}
      onMouseEnter={(e) => handleNavigationHover(e, true)}
      onMouseLeave={(e) => handleNavigationHover(e, false)}
    >
      {children}
    </button>
  )

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className={`d-flex justify-content-between align-items-center ${isMobile ? 'mb-3' : 'mb-2'}`}>
      {/* Left Navigation */}
      <div className="d-flex gap-1">
        <NavigationButton 
          direction="prev-year" 
          onClick={() => onNavigateYear(-1)}
        >
          <i className="fas fa-angle-double-left"></i>
        </NavigationButton>
        
        <NavigationButton 
          direction="prev-month" 
          onClick={() => onNavigateMonth(-1)}
        >
          <i className="fas fa-angle-left"></i>
        </NavigationButton>
      </div>

      {/* Center - Month/Year Dropdowns */}
      <div className="d-flex gap-1 position-relative">
        <div className="position-relative">
          <button
            type="button"
            className="btn btn-link text-dark text-decoration-none border-0 calendar-mobile-header"
            onClick={onToggleMonthDropdown}
            style={{ 
              transition: 'all 0.2s ease',
              fontSize: isMobile ? '15px' : '13px',
              fontWeight: 'normal',
              padding: isMobile ? '8px 12px' : '4px 8px'
            }}
            onMouseEnter={(e) => e.target.style.color = '#0d6efd'}
            onMouseLeave={(e) => e.target.style.color = '#212529'}
          >
            {months[currentDate.getMonth()]}
            <i className="fas fa-chevron-down ms-1" style={{ fontSize: isMobile ? '12px' : '10px' }}></i>
          </button>
          
          <MonthDropdown
            isVisible={showMonthDropdown}
            currentMonth={currentDate.getMonth()}
            isMobile={isMobile}
            months={months}
            onMonthChange={onMonthChange}
          />
        </div>

        <div className="position-relative">
          <button
            type="button"
            className="btn btn-link text-dark text-decoration-none border-0 calendar-mobile-header"
            onClick={onToggleYearDropdown}
            style={{ 
              transition: 'all 0.2s ease',
              fontSize: isMobile ? '15px' : '13px',
              fontWeight: 'normal',
              padding: isMobile ? '8px 12px' : '4px 8px'
            }}
            onMouseEnter={(e) => e.target.style.color = '#0d6efd'}
            onMouseLeave={(e) => e.target.style.color = '#212529'}
          >
            {currentDate.getFullYear()}
            <i className="fas fa-chevron-down ms-1" style={{ fontSize: isMobile ? '12px' : '10px' }}></i>
          </button>
          
          <YearDropdown
            isVisible={showYearDropdown}
            currentYear={currentDate.getFullYear()}
            isMobile={isMobile}
            onYearChange={onYearChange}
          />
        </div>
      </div>

      {/* Right Navigation */}
      <div className="d-flex gap-1">
        <NavigationButton 
          direction="next-month" 
          onClick={() => onNavigateMonth(1)}
        >
          <i className="fas fa-angle-right"></i>
        </NavigationButton>
        
        <NavigationButton 
          direction="next-year" 
          onClick={() => onNavigateYear(1)}
        >
          <i className="fas fa-angle-double-right"></i>
        </NavigationButton>
      </div>
    </div>
  )
}
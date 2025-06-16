'use client'

import { isToday, isSelected } from './calendarUtils'

export default function CalendarDay({
  dayObj,
  selectedDate,
  isMobile,
  onDateSelect
}) {

  const todayCheck = isToday(dayObj.date)
  const selectedCheck = isSelected(dayObj.date, selectedDate)

  const getButtonClasses = () => {
    let classes = 'btn w-100 border-0 position-relative'
    
    if (selectedCheck) {
      classes += ' btn-primary text-white'
    } else if (todayCheck) {
      classes += ' btn-outline-primary'
    } else {
      classes += ' btn-light text-dark'
    }
    
    return classes
  }

  const getButtonStyles = () => {
    return {
      minHeight: isMobile ? '44px' : '36px',
      fontSize: isMobile ? '14px' : '13px',
      transition: 'all 0.2s ease',
      opacity: dayObj.isCurrentMonth ? 1 : 0.4,
      backgroundColor: selectedCheck ? '#0d6efd' :
                     todayCheck ? 'transparent' :
                     dayObj.isCurrentMonth ? '#ffffff' : '#ffffff',
      fontWeight: 'normal',
      padding: isMobile ? '8px' : '8px',
      borderRadius: '4px'
    }
  }

  const handleMouseEnter = (e) => {
    if (!selectedCheck && !isMobile && dayObj.isCurrentMonth) {
      e.target.style.backgroundColor = '#f8f9fa'
      e.target.style.transform = 'scale(1.05)'
    }
  }

  const handleMouseLeave = (e) => {
    if (!selectedCheck && !isMobile) {
      e.target.style.backgroundColor = '#ffffff'
      e.target.style.transform = 'scale(1)'
    }
  }

  const handleClick = () => {
    onDateSelect(dayObj)
  }

  return (
    <button
      type="button"
      className={getButtonClasses()}
      onClick={handleClick}
      style={getButtonStyles()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={`Select ${dayObj.date.toLocaleDateString()}`}
      aria-pressed={selectedCheck}
      tabIndex={dayObj.isCurrentMonth ? 0 : -1}
    >
      {dayObj.date.getDate()}
    </button>
  )
}
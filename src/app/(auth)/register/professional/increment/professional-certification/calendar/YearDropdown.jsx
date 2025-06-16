'use client'

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

  const handleMouseEnter = (e, year) => {
    e.target.style.backgroundColor = '#f8f9fa'
    e.target.style.color = '#0d6efd'
  }

  const handleMouseLeave = (e, year) => {
    e.target.style.backgroundColor = 'transparent'
    e.target.style.color = year === currentYear ? '#0d6efd' : '#212529'
  }

  return (
    <div 
      className="position-absolute bg-white border rounded-2 shadow-lg py-1"
      style={{ 
        top: '100%', 
        right: '0', 
        zIndex: 1001,
        width: isMobile ? '100px' : '80px',
        maxHeight: isMobile ? '200px' : '180px',
        overflowY: 'auto'
      }}
    >
      {years.map(year => (
        <button
          key={year}
          type="button"
          className={`btn btn-link text-start w-100 text-decoration-none border-0 ${
            year === currentYear ? 'text-primary' : 'text-dark'
          }`}
          onClick={() => handleYearClick(year)}
          onMouseEnter={(e) => handleMouseEnter(e, year)}
          onMouseLeave={(e) => handleMouseLeave(e, year)}
          style={{ 
            transition: 'all 0.2s ease',
            fontSize: isMobile ? '14px' : '12px',
            fontWeight: 'normal',
            padding: isMobile ? '12px 16px' : '8px 12px',
            minHeight: isMobile ? '44px' : 'auto'
          }}
        >
          {year}
        </button>
      ))}
    </div>
  )
}
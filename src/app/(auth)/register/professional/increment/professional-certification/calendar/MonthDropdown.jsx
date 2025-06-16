'use client'

export default function MonthDropdown({
  isVisible,
  currentMonth,
  isMobile,
  months,
  onMonthChange
}) {

  if (!isVisible) return null

  const handleMonthClick = (monthIndex) => {
    onMonthChange(monthIndex)
  }

  const handleMouseEnter = (e, monthIndex) => {
    e.target.style.backgroundColor = '#f8f9fa'
    e.target.style.color = '#0d6efd'
  }

  const handleMouseLeave = (e, monthIndex) => {
    e.target.style.backgroundColor = 'transparent'
    e.target.style.color = monthIndex === currentMonth ? '#0d6efd' : '#212529'
  }

  return (
    <div 
      className="position-absolute bg-white border rounded-2 shadow-lg py-1"
      style={{ 
        top: '100%', 
        left: '0', 
        zIndex: 1001,
        minWidth: isMobile ? '140px' : '100px',
        maxHeight: isMobile ? '200px' : '180px',
        overflowY: 'auto'
      }}
    >
      {months.map((month, index) => (
        <button
          key={month}
          type="button"
          className={`btn btn-link text-start w-100 text-decoration-none border-0 ${
            index === currentMonth ? 'text-primary' : 'text-dark'
          }`}
          onClick={() => handleMonthClick(index)}
          onMouseEnter={(e) => handleMouseEnter(e, index)}
          onMouseLeave={(e) => handleMouseLeave(e, index)}
          style={{ 
            transition: 'all 0.2s ease',
            fontSize: isMobile ? '14px' : '12px',
            fontWeight: 'normal',
            padding: isMobile ? '12px 16px' : '8px 12px',
            minHeight: isMobile ? '44px' : 'auto'
          }}
        >
          {month}
        </button>
      ))}
    </div>
  )
}
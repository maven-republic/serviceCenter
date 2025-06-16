'use client'

export default function CalendarInput({ 
  selectedDate, 
  placeholder, 
  isMobile, 
  onClick, 
  formatDisplayDate 
}) {
  
  const handleMouseEnter = (e) => {
    if (!isMobile) {
      e.target.style.borderColor = '#0d6efd'
      e.target.style.boxShadow = '0 0 0 0.2rem rgba(13, 110, 253, 0.15)'
    }
  }

  const handleMouseLeave = (e) => {
    if (!isMobile) {
      e.target.style.borderColor = '#ced4da'
      e.target.style.boxShadow = 'none'
    }
  }

  return (
    <div
      className="form-control rounded-3 px-3 py-2 d-flex justify-content-between align-items-center"
      style={{ 
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minHeight: isMobile ? '48px' : 'auto'
      }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span 
        className={selectedDate ? 'text-dark' : 'text-muted'}
        style={{ fontSize: isMobile ? '16px' : '14px' }}
      >
        {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
      </span>
      
      <i 
        className="fas fa-calendar-alt text-muted" 
        style={{ fontSize: isMobile ? '18px' : '14px' }}
      />
    </div>
  )
}
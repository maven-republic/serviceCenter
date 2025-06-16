'use client'

export default function CalendarFooter({
  isMobile,
  onTodayClick,
  onClearClick
}) {

  const handleMouseEnter = (e) => {
    if (!isMobile) {
      e.target.style.transform = 'translateY(-1px)'
    }
  }

  const handleMouseLeave = (e) => {
    if (!isMobile) {
      e.target.style.transform = 'translateY(0)'
    }
  }

  const ActionButton = ({ onClick, variant, children, ariaLabel }) => (
    <button
      type="button"
      className={`btn ${variant} btn-sm ${isMobile ? 'px-3 py-2' : 'px-2 py-1'}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={ariaLabel}
      style={{ 
        transition: 'all 0.2s ease',
        fontSize: isMobile ? '14px' : '11px',
        fontWeight: 'normal',
        minHeight: isMobile ? '40px' : 'auto'
      }}
    >
      {children}
    </button>
  )

  return (
    <div className={`d-flex justify-content-between align-items-center border-top ${isMobile ? 'mt-3 pt-3' : 'mt-2 pt-2'}`}>
      <ActionButton
        onClick={onTodayClick}
        variant="btn-outline-secondary"
        ariaLabel="Select today's date"
      >
        Today
      </ActionButton>

      <ActionButton
        onClick={onClearClick}
        variant="btn-outline-danger"
        ariaLabel="Clear selected date"
      >
        Clear
      </ActionButton>
    </div>
  )
}
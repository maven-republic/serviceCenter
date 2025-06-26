'use client'

import { format } from 'date-fns'

export default function EditAvailabilityMenu({ date, onEditDate, onEditDay }) {
  const weekday = format(date, 'EEEE') // e.g. Monday

  return (
    <div
      className="position-absolute shadow border p-2 small"
      style={{
        top: '10px',
        left: '10px',
        zIndex: 1000,
        minWidth: '160px',
        backgroundColor: 'white',
        borderRadius: '0.375rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        role="button"
        onClick={(e) => {
          e.stopPropagation()
          onEditDate(date)
        }}
        className="d-flex align-items-center gap-2 py-1 px-2 rounded hover:bg-light"
      >
        <i className="fas fa-calendar-alt text-secondary" />
        <span>Edit date</span>
      </div>

      <div
        role="button"
        onClick={(e) => {
          e.stopPropagation()
          onEditDay(date.getDay())
        }}
        className="d-flex align-items-center gap-2 py-1 px-2 rounded hover:bg-light"
      >
        <i className="fas fa-repeat text-secondary" />
        <span>Edit all {weekday}s</span>
      </div>
    </div>
  )
}


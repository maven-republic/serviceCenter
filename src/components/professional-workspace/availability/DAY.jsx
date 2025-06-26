'use client'

import { format, parse, parseISO, isValid } from 'date-fns'

function formatTime12(timeStr) {
  if (!timeStr) return ''
  try {
    let parsed
    if (typeof timeStr === 'string' && timeStr.length <= 5 && timeStr.includes(':')) {
      parsed = parse(timeStr, 'HH:mm', new Date())
    } else {
      parsed = parseISO(timeStr)
    }
    return isValid(parsed) ? format(parsed, 'h:mm a') : ''
  } catch {
    return ''
  }
}

export default function Day({ date, isToday, slots = [] }) {
  return (
    <div
      className={`px-1 py-1 text-muted small d-flex flex-column justify-content-between border rounded-0 ${
        isToday ? 'bg-primary text-white' : 'bg-white'
      }`}
      style={{ height: '80px', fontSize: '0.75rem' }}
    >
      <div className="fw-semibold">{format(date, 'EEE dd')}</div>

      {slots.length === 0 ? (
        <div style={{ fontSize: '0.65rem' }}>–</div>
      ) : (
        <span className="text-success">●</span>
      )}
    </div>
  )
}

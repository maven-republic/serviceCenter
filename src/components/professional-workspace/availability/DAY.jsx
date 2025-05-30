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
     className={`h-[120px] p-2 text-xs flex flex-col justify-between border rounded-sm transition ${
       isToday ? 'bg-primary text-white' : 'bg-white hover:bg-gray-50'
     }`}
   >
      <div className="fw-semibold mb-1">
        {format(date, 'EEE dd')}
      </div>

      {slots.length === 0 ? (
        <div className="text-xs text-muted">Unavailable</div>
      ) : (
        slots.map((slot, i) => (
          <div key={i} className="text-xs text-success">
            {formatTime12(slot.start_time)} – {formatTime12(slot.end_time)}
          </div>
        ))
      )}
    </div>
  )
}

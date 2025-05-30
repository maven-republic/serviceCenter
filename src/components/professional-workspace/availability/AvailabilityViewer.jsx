'use client'

import AvailabilityCalendar from './AvailabilityCalendar'

export default function AvailabilityViewer({ availability = [], overrides = [] }) {
  return (
    <section className="container py-5">
      <h2 className="fw-bold mb-4">My Calendar Availability</h2>
      <AvailabilityCalendar availability={availability} overrides={overrides} />

      <div className="mt-4 text-sm text-muted">
        <strong>Legend:</strong>
        <div className="flex gap-4 mt-1">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary rounded-sm" /> Today
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white border rounded-sm" /> Available
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-light border rounded-sm" /> Unavailable
          </span>
        </div>
      </div>
    </section>
  )
}

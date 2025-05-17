'use client'

export default function AvailabilityProtocol({ rules, setRules }) {
  const updateRule = (name, value) => {
    setRules(prev => ({ ...prev, [name]: parseInt(value) }))
  }

  return (
    <div className="container py-4 px-2 px-md-4">
      <div className="mb-5">
        <h2 className="fw-bold mb-1">Availability Protocol</h2>
        <p className="text-muted">Set your scheduling preferences just like on Calendly.</p>
      </div>

      {/* Rule Group */}
      <div className="border-top pt-4">
        {/* Default Event Duration */}
        <div className="row align-items-center mb-4">
          <div className="col-md-5">
            <label className="form-label fw-semibold mb-1">Default Event Duration</label>
            <p className="text-muted small mb-0">How long each session lasts.</p>
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={rules.default_event_duration || ''}
              onChange={e => updateRule('default_event_duration', e.target.value)}
            >
              <option value="">Select duration</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
        </div>

        {/* Minimum Notice */}
        <div className="row align-items-center mb-4">
          <div className="col-md-5">
            <label className="form-label fw-semibold mb-1">Minimum Scheduling Notice</label>
            <p className="text-muted small mb-0">Prevent last-minute bookings.</p>
          </div>
          <div className="col-md-4 d-flex align-items-center">
            <input
              type="number"
              min={0}
              className="form-control me-2"
              value={rules.min_notice_hours || ''}
              onChange={e => updateRule('min_notice_hours', e.target.value)}
              placeholder="e.g. 12"
            />
            <span className="text-muted">hours</span>
          </div>
        </div>

        {/* Buffer Time */}
        <div className="row align-items-center mb-4">
          <div className="col-md-5">
            <label className="form-label fw-semibold mb-1">Buffer Between Bookings</label>
            <p className="text-muted small mb-0">Break time before or after events.</p>
          </div>
          <div className="col-md-4 d-flex align-items-center">
            <input
              type="number"
              min={0}
              className="form-control me-2"
              value={rules.buffer_minutes || ''}
              onChange={e => updateRule('buffer_minutes', e.target.value)}
              placeholder="e.g. 15"
            />
            <span className="text-muted">minutes</span>
          </div>
        </div>

        {/* Max Bookings Per Day */}
        <div className="row align-items-center mb-2">
          <div className="col-md-5">
            <label className="form-label fw-semibold mb-1">Max Bookings Per Day</label>
            <p className="text-muted small mb-0">Optional limit to avoid overbooking.</p>
          </div>
          <div className="col-md-4">
            <input
              type="number"
              min={1}
              className="form-control"
              value={rules.max_bookings_per_day || ''}
              onChange={e => updateRule('max_bookings_per_day', e.target.value)}
              placeholder="e.g. 3"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

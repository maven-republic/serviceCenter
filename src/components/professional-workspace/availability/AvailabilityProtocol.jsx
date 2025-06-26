'use client'

export default function AvailabilityProtocol({ rules, setRules, onSave, isSaving }) {
  const updateRule = (name, value) => {
    setRules(prev => ({ ...prev, [name]: parseInt(value) || null }))
  }

  const handleSave = () => {
    onSave(rules)
  }

  return (
    <div className="container py-4 px-2 px-md-4">
      <div className="mb-5">
        <h2 className="fw-bold mb-1">Availability Protocol</h2>
        <p className="text-muted">Set your scheduling preferences and booking rules.</p>
      </div>

      {/* Rule Group */}
      <div className="row">
        <div className="col-lg-8">
          <div className="border-top pt-4">
            {/* Default Event Duration */}
            <div className="row align-items-center mb-4">
              <div className="col-md-5">
                <label className="form-label fw-semibold mb-1">Default Event Duration</label>
                <p className="text-muted small mb-0">How long each session lasts by default.</p>
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
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>
            </div>

            {/* Minimum Notice */}
            <div className="row align-items-center mb-4">
              <div className="col-md-5">
                <label className="form-label fw-semibold mb-1">Minimum Scheduling Notice</label>
                <p className="text-muted small mb-0">Prevent last-minute bookings by requiring advance notice.</p>
              </div>
              <div className="col-md-4 d-flex align-items-center">
                <input
                  type="number"
                  min={0}
                  max={168} // 1 week
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
                <p className="text-muted small mb-0">Break time before or after events to prepare or travel.</p>
              </div>
              <div className="col-md-4 d-flex align-items-center">
                <input
                  type="number"
                  min={0}
                  max={120}
                  className="form-control me-2"
                  value={rules.buffer_minutes || ''}
                  onChange={e => updateRule('buffer_minutes', e.target.value)}
                  placeholder="e.g. 15"
                />
                <span className="text-muted">minutes</span>
              </div>
            </div>

            {/* Max Bookings Per Day */}
            <div className="row align-items-center mb-4">
              <div className="col-md-5">
                <label className="form-label fw-semibold mb-1">Max Bookings Per Day</label>
                <p className="text-muted small mb-0">Optional limit to prevent overbooking and maintain quality.</p>
              </div>
              <div className="col-md-4">
                <input
                  type="number"
                  min={1}
                  max={20}
                  className="form-control"
                  value={rules.max_bookings_per_day || ''}
                  onChange={e => updateRule('max_bookings_per_day', e.target.value)}
                  placeholder="e.g. 3"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="border-top pt-4 mt-4">
            <button 
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="col-lg-4">
          <div className="bg-light p-4 rounded">
            <h6 className="fw-semibold mb-3">
              <i className="fas fa-info-circle text-primary me-2"></i>
              How it works
            </h6>
            
            <div className="small text-muted">
              <div className="mb-3">
                <strong>Event Duration:</strong> Sets the default length for new bookings. Clients can see this when scheduling.
              </div>
              
              <div className="mb-3">
                <strong>Minimum Notice:</strong> Prevents bookings too close to the current time. For example, 12 hours means no same-day bookings.
              </div>
              
              <div className="mb-3">
                <strong>Buffer Time:</strong> Automatically blocks time before/after bookings. Useful for travel time or preparation.
              </div>
              
              <div className="mb-0">
                <strong>Daily Limit:</strong> Caps the number of bookings per day to maintain service quality and prevent burnout.
              </div>
            </div>
          </div>

          {/* Current Settings Preview */}
          <div className="mt-4 p-3 border rounded">
            <h6 className="fw-semibold mb-2">Current Settings</h6>
            <div className="small">
              <div className="d-flex justify-content-between mb-1">
                <span>Duration:</span>
                <span className="fw-medium">
                  {rules.default_event_duration ? `${rules.default_event_duration} min` : 'Not set'}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Notice:</span>
                <span className="fw-medium">
                  {rules.min_notice_hours ? `${rules.min_notice_hours}h` : 'Not set'}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Buffer:</span>
                <span className="fw-medium">
                  {rules.buffer_minutes ? `${rules.buffer_minutes} min` : 'Not set'}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Daily limit:</span>
                <span className="fw-medium">
                  {rules.max_bookings_per_day || 'Unlimited'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
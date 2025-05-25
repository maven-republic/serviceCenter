'use client'

export default function Pricing({ formData, updateFormData }) {
  return (
    <div className="row">
      <div className="col-md-5">
        <div className="pe-md-4">
          <h2 className="mb-3">Pricing</h2>
          <p className="text-muted mb-3">
            Set your service rates. These help clients understand what to expect.
          </p>
        </div>
      </div>

      <div className="col-md-7">
        {/* Hourly Rate */}
        <div className="mb-4">
          <label className="form-label fw-semibold">Hourly Rate (JMD)</label>
          <input
            type="number"
            name="hourlyRate"
            value={formData.hourlyRate}
            onChange={updateFormData}
            className="form-control"
            placeholder="e.g. 2500"
          />
        </div>

        {/* Daily Rate */}
        <div className="mb-4">
          <label className="form-label fw-semibold">Daily Rate (JMD)</label>
          <input
            type="number"
            name="dailyRate"
            value={formData.dailyRate}
            onChange={updateFormData}
            className="form-control"
            placeholder="e.g. 15000"
          />
        </div>
      </div>
    </div>
  )
}


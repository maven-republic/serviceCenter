'use client'

import AddressMap from '@/components/Address/AddressMap'

export default function Pricing({
  formData,
  updateFormData
}) {
  return (
    <div className="row">
      {/* Left column */}
      <div className="col-md-5">
        <div className="mb-4">
          <h4 className="mb-3">How do you price your services?</h4>
          <p className="text-muted">Set your preferred rates and service area</p>
        </div>
      </div>

      {/* Right column */}
      <div className="col-md-7">
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Price per hour ($J)</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                name="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={updateFormData}
                className="form-control"
                placeholder="e.g., 5000"
                min="0"
              />
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Price per day ($J)</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                name="dailyRate"
                type="number"
                value={formData.dailyRate}
                onChange={updateFormData}
                className="form-control"
                placeholder="e.g., 30000"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">
            Service Radius: {formData.serviceRadius} km
          </label>
          <input
            type="range"
            name="serviceRadius"
            min="1"
            max="50"
            step="1"
            value={formData.serviceRadius}
            onChange={updateFormData}
            className="form-range"
          />
          <small className="text-muted">
            Use the slider to set how far you're willing to travel from your primary location.
          </small>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Map of your service area</label>
          <AddressMap
            lat={formData.latitude}
            lng={formData.longitude}
            radius={formData.serviceRadius || 0}
          />
        </div>
      </div>
    </div>
  )
}

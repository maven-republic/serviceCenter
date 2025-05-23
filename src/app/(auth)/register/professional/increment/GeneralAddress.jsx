'use client'

import Address from '@/components/Address/Address'
import AddressMap from '@/components/Address/AddressMap'

export default function GeneralAddress({
  formData,
  errors,
  handleAddressSelect,
  updateFormData
}) {
  return (
    <div className="row">
      {/* Left column: explanation */}
      <div className="col-md-5">
        <div className="pe-md-4">
          <h4 className="mb-3">Address & Service Area</h4>
          <p className="text-muted">
            Provide your home base address and how far you're willing to travel for work.
          </p>
        </div>
      </div>

      {/* Right column: form inputs */}
      <div className="col-md-7">
        {/* Address Input */}
        <div className="mb-4">
          <label className="form-label fw-semibold">Street Address</label>
          <Address
            defaultValue={formData.formattedAddress}
            onSelect={handleAddressSelect}
          />
          {errors.streetAddress && (
            <div className="invalid-feedback d-block">
              {errors.streetAddress}
            </div>
          )}
        </div>

        {/* Radius Slider */}
        <div className="mb-4">
          <label className="form-label fw-semibold">
            Service Area: {formData.serviceRadius} km
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
            This defines how far away from your home you're willing to work.
          </small>
        </div>

        {/* AddressMap Preview */}
        {formData.latitude && formData.longitude && (
          <div className="mb-4">
            {/* <label className="form-label fw-semibold">Service Area</label> */}
            <AddressMap
              lat={formData.latitude}
              lng={formData.longitude}
              radius={formData.serviceRadius || 0}
            />
          </div>
        )}

        {/* Rural Checkbox */}
        <div className="mb-4">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="isRural"
              name="isRural"
              checked={formData.isRural}
              onChange={e =>
                updateFormData({
                  target: {
                    name: 'isRural',
                    value: e.target.checked
                  }
                })
              }
            />
            <label className="form-check-label" htmlFor="isRural">
              This is a rural address
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

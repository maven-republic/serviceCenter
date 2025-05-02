'use client'

import Address from '@/components/Address/Address'

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
          <h4 className="mb-3">Address Information</h4>
          <p className="text-muted">Provide your primary address details</p>
        </div>
      </div>

      {/* Right column: form inputs */}
      <div className="col-md-7">
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

        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Community (Optional)</label>
            <input
              name="community"
              type="text"
              value={formData.community}
              onChange={updateFormData}
              className="form-control"
              placeholder="Enter community name"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Landmark (Optional)</label>
            <input
              name="landmark"
              type="text"
              value={formData.landmark}
              onChange={updateFormData}
              className="form-control"
              placeholder="Nearby landmark"
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="isRural"
              name="isRural"
              checked={formData.isRural}
              onChange={e => updateFormData({ target: { name: 'isRural', value: e.target.checked } })}
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

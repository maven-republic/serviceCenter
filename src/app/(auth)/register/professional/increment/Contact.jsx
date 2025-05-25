'use client'

export default function Contact({
  formData,
  errors,
  updateFormData,
  handleBlur
}) {
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">Phone Number</label>
      <input
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={updateFormData}
        onBlur={handleBlur}
        className={`form-control ${errors.phone ? 'is-invalid' : formData.phone ? 'is-valid' : ''}`}
        placeholder="876-123-4567"
        required
        aria-describedby="phoneFeedback"
      />
      {errors.phone && (
        <div id="phoneFeedback" className="invalid-feedback">
          {errors.phone}
        </div>
      )}
      <small className="form-text text-muted">
        Enter a valid phone number (e.g., 8761234567)
      </small>
    </div>
  )
}


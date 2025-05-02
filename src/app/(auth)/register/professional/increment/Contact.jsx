'use client'

export default function Contact({
  formData,
  errors,
  updateFormData,
  handleBlur
}) {
  return (
    <div className="row">
      {/* Left column */}
      <div className="col-md-5">
        <div className="mb-4">
          <h4 className="mb-3">Contact Information</h4>
          <p className="text-muted">How clients will reach you</p>
        </div>
      </div>

      {/* Right column */}
      <div className="col-md-7">
        <div className="mb-4">
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

        <div className="mb-4">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="agreeTerms"
              required
            />
            <label className="form-check-label" htmlFor="agreeTerms">
              I agree to the <a href="/terms" className="text-primary">Terms of Service</a> and <a href="/privacy" className="text-primary">Privacy Policy</a>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

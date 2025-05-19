'use client'

export default function Personal({
  formData,
  errors,
  updateFormData,
  handleBlur
}) {
  return (
    <div className="row">
      {/* Left column: explanatory text */}
      <div className="col-md-5">
        <div className="pe-md-4">
          <h2 className="mb-3">Personal Information</h2>
          <p className="text-muted mb-3">
            Tell clients about yourself. Your personal information helps establish your identity on the platform and builds trust with potential clients.
          </p>
          <p className="text-muted mb-3">
            Your experience level is important as clients often look for professionals with specific levels of expertise for their projects.
          </p>
        </div>
      </div>

      {/* Right column: form fields */}
      <div className="col-md-7">
        <div className="mb-4">
          <label className="form-label fw-semibold">First Name</label>
          <input
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={updateFormData}
            onBlur={handleBlur}
            className={`form-control ${errors.firstName ? 'is-invalid' : formData.firstName ? 'is-valid' : ''}`}
            placeholder="John"
            required
            aria-describedby="firstNameFeedback"
          />
          {errors.firstName && (
            <div id="firstNameFeedback" className="invalid-feedback">
              {errors.firstName}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Last Name</label>
          <input
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={updateFormData}
            onBlur={handleBlur}
            className={`form-control ${errors.lastName ? 'is-invalid' : formData.lastName ? 'is-valid' : ''}`}
            placeholder="Smith"
            required
            aria-describedby="lastNameFeedback"
          />
          {errors.lastName && (
            <div id="lastNameFeedback" className="invalid-feedback">
              {errors.lastName}
            </div>
          )}
        </div>
        
      </div>
    </div>
  )
}

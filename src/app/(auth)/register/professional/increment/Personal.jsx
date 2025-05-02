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

        <div className="mb-4">
          <label className="form-label fw-semibold">Years of Experience</label>
          <select
            name="experience"
            value={formData.experience}
            onChange={updateFormData}
            onBlur={handleBlur}
            className={`form-select ${errors.experience ? 'is-invalid' : formData.experience ? 'is-valid' : ''}`}
            required
            aria-describedby="experienceFeedback"
          >
            <option value="">Select years of experience</option>
            <option value="0">Less than 1 year</option>
            {[...Array(15)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} year{i !== 0 ? 's' : ''}
              </option>
            ))}
            <option value="15+">More than 15 years</option>
          </select>
          {errors.experience && (
            <div id="experienceFeedback" className="invalid-feedback">
              {errors.experience}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

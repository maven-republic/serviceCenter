'use client'

import Link from 'next/link'
// increment/Account.jsx
import styles from './Account.module.css'


export default function Account({
  formData,
  errors,
  updateFormData,
  handleBlur,
  isCheckingEmail
}) {
  return (
    <div className="row">
      {/* Left column: intro and login link */}
      <div className="col-md-5">
        <div className="pe-md-4">
          <h4 className="mb-3">Create your professional account</h4>
          <p className="text-muted mb-4">
            Join our platform to connect with clients looking for your professional services.
            Setting up your account gives you a presence on our marketplace where customers can discover and hire you.
          </p>
          <p className="text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-primary fw-bold">
              Log In!
            </Link>
          </p>
        </div>
      </div>

      {/* Right column: email/password inputs */}
      <div className="col-md-7">
        <div className="mb-4">
          <label className="form-label fw-semibold">Email Address</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={updateFormData}
            onBlur={handleBlur}
            className={`form-control ${errors.email ? 'is-invalid' : formData.email ? 'is-valid' : ''}`}
            placeholder="professional@email.com"
            required
            aria-describedby="emailFeedback"
          />
          {isCheckingEmail && (
            <div className="input-group-append">
              <span className="input-group-text bg-transparent">
                <i className="fas fa-spinner fa-spin"></i>
              </span>
            </div>
          )}
          {errors.email && (
            <div id="emailFeedback" className="invalid-feedback">
              {errors.email}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Password</label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={updateFormData}
            onBlur={handleBlur}
            className={`form-control ${errors.password ? 'is-invalid' : formData.password ? 'is-valid' : ''}`}
            placeholder="•••••••••••"
            required
            aria-describedby="passwordFeedback"
          />
          {errors.password && (
            <div id="passwordFeedback" className="invalid-feedback">
              {errors.password}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Confirm Password</label>
          <input
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={updateFormData}
            onBlur={handleBlur}
            className={`form-control ${errors.confirmPassword ? 'is-invalid' : formData.confirmPassword ? 'is-valid' : ''}`}
            placeholder="•••••••••••"
            required
            aria-describedby="confirmPasswordFeedback"
          />
          {errors.confirmPassword && (
            <div id="confirmPasswordFeedback" className="invalid-feedback">
              {errors.confirmPassword}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

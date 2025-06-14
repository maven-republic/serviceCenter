'use client'
import React from 'react'
import Link from 'next/link'
import Contact from './Contact'
import _Account from './Account.module.css'

export default function Account({ formData, updateFormData, errors, handleBlur }) {
  return (
    <div className={`container-fluid vh-100 p-0 ${_Account.container}`}>
      <div className={`row h-100 g-0 ${_Account.row}`}>
        {/* Left column: Image/Visual */}

                <div className={`col-12 col-lg-6 d-none d-lg-flex align-items-center justify-content-center position-relative p-0 ${_Account.leftColumn}`}>

        {/* <div className={`col-12 col-lg-6 d-none d-lg-flex align-items-center justify-content-center position-relative p-0 rounded-start-5 ${_Account.leftColumn}`}> */}
          
          {/* Overlay for better text readability */}
          <div className={`position-absolute w-100 h-100 ${_Account.overlay}`}></div>
          
          {/* Background image */}
          <img 
            src="/images/black-man-working.jpg" 
            alt="Professional workspace" 
            className={`position-absolute w-100 h-100 ${_Account.backgroundImage}`}
          />
        </div>

        {/* Right column: Form content */}
        <div className={`col-12 col-lg-6 d-flex align-items-center p-0 ${_Account.rightColumn}`}>
          <div className={`w-100 px-4 px-lg-5 py-4 ${_Account.formContainer}`}>
            <div className={`mx-auto ${_Account.formContent}`}>
              
              {/* Header */}
              <div className="mb-4">
                <h2 className="fw-bold mb-3">Create your professional account</h2>
                <p className="text-muted">
                  Join our platform to connect with clients looking for your professional services.
                </p>
              </div>

              {/* Contact Component */}
              <div className="mb-4">
                <Contact
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                  handleBlur={handleBlur}
                />
              </div>

              {/* Password */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-semibold">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  value={formData.password}
                  onChange={updateFormData}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label fw-semibold">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  value={formData.confirmPassword}
                  onChange={updateFormData}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>

              {/* Login link */}
              <div className="text-center">
                <p className="text-muted">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary fw-bold text-decoration-none">
                    Log In!
                  </Link>
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
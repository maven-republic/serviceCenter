'use client'
import React from 'react'
import Link from 'next/link'
import Contact from './Contact' // adjust path if needed

export default function Account({ formData, updateFormData, errors, handleBlur }) {
  return (
    <div className="container py-4">
      <div className="row">
        {/* Left column: intro text */}
        <div className="col-12 col-md-6 mb-4 d-none d-md-block">
          <div className="pe-md-4">
            <h4 className="fw-bold mb-3">Create your professional account</h4>
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

        {/* Right column: form fields */}
        <div className="col-12 col-md-6">
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
          <div className="mb-3">
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
        </div>
      </div>
    </div>
  )
}


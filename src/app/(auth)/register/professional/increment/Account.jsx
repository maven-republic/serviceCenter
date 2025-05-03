'use client'
import React from 'react'
import Link from 'next/link'

export default function Account({ formData, updateFormData, errors, handleBlur }) {
  return (
    <div className="container py-4">
      <div className="row">
        {/* Left column: intro and login link */}
        <div className="col-md-6 mb-4">
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

        {/* Right column: form */}
        <div className="col-md-6">
          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-medium">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={formData.email}
              onChange={updateFormData}
              onBlur={handleBlur}
              placeholder="you@example.com"
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-medium">Password</label>
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
            <label htmlFor="confirmPassword" className="form-label fw-medium">Confirm Password</label>
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

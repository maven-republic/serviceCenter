// src/components/forms/AppointmentInteractionForm.jsx
'use client'

import { useState, useCallback, useMemo } from 'react'

export default function AppointmentInteractionForm({
  appointment,
  action, // 'accept', 'decline', 'quote'
  onSubmit,
  onCancel,
  loading = false
}) {
  const [formData, setFormData] = useState({
    // Response details
    professional_notes: '',
    estimated_duration: appointment?.service?.duration_minutes || 60,
    
    // Scheduling adjustments
    suggested_start: appointment?.preferred_start || '',
    suggested_end: '',
    
    // Pricing (for quotes)
    quoted_price: appointment?.service?.base_price || '',
    price_breakdown: '',
    
    // Additional details
    requirements: '',
    next_steps: '',
    
    // Decline reasons
    decline_reason: '',
    alternative_suggestions: ''
  })
  
  const [errors, setErrors] = useState({})

  // Handle form field changes
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
    
    // Auto-calculate end time when duration changes
    if (field === 'estimated_duration' || field === 'suggested_start') {
      const startTime = field === 'suggested_start' ? value : formData.suggested_start
      const duration = field === 'estimated_duration' ? value : formData.estimated_duration
      
      if (startTime && duration) {
        const endTime = new Date(new Date(startTime).getTime() + duration * 60000)
        setFormData(prev => ({
          ...prev,
          suggested_end: endTime.toISOString().slice(0, 16)
        }))
      }
    }
  }, [formData.suggested_start, formData.estimated_duration, errors])

  // Validate form based on action
  const validateForm = useCallback(() => {
    const newErrors = {}
    
    if (action === 'accept') {
      if (!formData.suggested_start) {
        newErrors.suggested_start = 'Please confirm or adjust the start time'
      }
      
      if (!formData.estimated_duration || formData.estimated_duration < 15) {
        newErrors.estimated_duration = 'Duration must be at least 15 minutes'
      }
      
      // Validate start time is in the future
      if (formData.suggested_start) {
        const startDate = new Date(formData.suggested_start)
        if (startDate <= new Date()) {
          newErrors.suggested_start = 'Start time must be in the future'
        }
      }
    }
    
    if (action === 'quote') {
      if (!formData.quoted_price || isNaN(formData.quoted_price) || formData.quoted_price <= 0) {
        newErrors.quoted_price = 'Please provide a valid quoted price'
      }
      
      if (!formData.professional_notes.trim()) {
        newErrors.professional_notes = 'Please provide details about your quote'
      }
    }
    
    if (action === 'decline') {
      if (!formData.decline_reason.trim()) {
        newErrors.decline_reason = 'Please provide a reason for declining'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [action, formData])

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    // Prepare submission data based on action
    const submissionData = {
      action,
      appointment_id: appointment.appointment_id,
      ...formData
    }
    
    // Clean up data based on action
    if (action === 'accept') {
      delete submissionData.decline_reason
      delete submissionData.alternative_suggestions
      delete submissionData.quoted_price
      delete submissionData.price_breakdown
    } else if (action === 'decline') {
      delete submissionData.quoted_price
      delete submissionData.price_breakdown
      delete submissionData.suggested_start
      delete submissionData.suggested_end
      delete submissionData.estimated_duration
    } else if (action === 'quote') {
      delete submissionData.decline_reason
      delete submissionData.alternative_suggestions
    }
    
    await onSubmit(submissionData)
  }, [action, appointment.appointment_id, formData, onSubmit, validateForm])

  // Get minimum datetime (now)
  const minDateTime = useMemo(() => {
    return new Date().toISOString().slice(0, 16)
  }, [])

  // Get action-specific styling and content
  const getActionConfig = () => {
    switch (action) {
      case 'accept':
        return {
          title: 'Accept Appointment',
          icon: 'flaticon-check',
          color: 'success',
          submitText: loading ? 'Accepting...' : 'Accept & Create Booking'
        }
      case 'decline':
        return {
          title: 'Decline Appointment',
          icon: 'flaticon-close',
          color: 'danger',
          submitText: loading ? 'Declining...' : 'Decline Appointment'
        }
      case 'quote':
        return {
          title: 'Send Quote',
          icon: 'flaticon-price-tag',
          color: 'info',
          submitText: loading ? 'Sending Quote...' : 'Send Quote to Customer'
        }
      default:
        return {
          title: 'Respond to Appointment',
          icon: 'flaticon-chat',
          color: 'primary',
          submitText: 'Submit Response'
        }
    }
  }

  const actionConfig = getActionConfig()

  return (
    <div className="appointment-interaction-form">
      {/* Form Header */}
      <div className="form-header">
        <div className="header-icon">
          <i className={`${actionConfig.icon} text-${actionConfig.color}`}></i>
        </div>
        <div className="header-content">
          <h4 className="form-title">{actionConfig.title}</h4>
          <p className="form-subtitle">
            Respond to {appointment?.customer?.account?.first_name}'s request for "{appointment?.service?.name || appointment?.title}"
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="interaction-form">
        
        {/* Accept Form Fields */}
        {action === 'accept' && (
          <div className="form-section">
            <h6 className="section-title">
              <i className="flaticon-calendar"></i>
              Confirm Scheduling Details
            </h6>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="suggested_start">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  id="suggested_start"
                  className={`form-control ${errors.suggested_start ? 'is-invalid' : ''}`}
                  value={formData.suggested_start}
                  onChange={(e) => handleChange('suggested_start', e.target.value)}
                  min={minDateTime}
                  required
                />
                {errors.suggested_start && (
                  <div className="invalid-feedback">{errors.suggested_start}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="estimated_duration">Estimated Duration (minutes) *</label>
                <input
                  type="number"
                  id="estimated_duration"
                  className={`form-control ${errors.estimated_duration ? 'is-invalid' : ''}`}
                  value={formData.estimated_duration}
                  onChange={(e) => handleChange('estimated_duration', parseInt(e.target.value))}
                  min="15"
                  max="480"
                  step="15"
                  required
                />
                {errors.estimated_duration && (
                  <div className="invalid-feedback">{errors.estimated_duration}</div>
                )}
                <small className="form-text">
                  {formData.suggested_end && (
                    <>Estimated end time: {new Date(formData.suggested_end).toLocaleString()}</>
                  )}
                </small>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="requirements">Requirements & Preparation</label>
              <textarea
                id="requirements"
                className="form-control"
                rows="3"
                value={formData.requirements}
                onChange={(e) => handleChange('requirements', e.target.value)}
                placeholder="Any requirements the customer should prepare before the appointment..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="next_steps">Next Steps</label>
              <textarea
                id="next_steps"
                className="form-control"
                rows="2"
                value={formData.next_steps}
                onChange={(e) => handleChange('next_steps', e.target.value)}
                placeholder="What happens after you accept this appointment..."
              />
            </div>
          </div>
        )}

        {/* Quote Form Fields */}
        {action === 'quote' && (
          <div className="form-section">
            <h6 className="section-title">
              <i className="flaticon-price-tag"></i>
              Pricing & Quote Details
            </h6>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="quoted_price">Quoted Price (JMD) *</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    id="quoted_price"
                    className={`form-control ${errors.quoted_price ? 'is-invalid' : ''}`}
                    value={formData.quoted_price}
                    onChange={(e) => handleChange('quoted_price', e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                  {errors.quoted_price && (
                    <div className="invalid-feedback">{errors.quoted_price}</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="estimated_duration">Estimated Duration (minutes)</label>
                <input
                  type="number"
                  id="estimated_duration"
                  className="form-control"
                  value={formData.estimated_duration}
                  onChange={(e) => handleChange('estimated_duration', parseInt(e.target.value))}
                  min="15"
                  max="480"
                  step="15"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="price_breakdown">Price Breakdown (Optional)</label>
              <textarea
                id="price_breakdown"
                className="form-control"
                rows="3"
                value={formData.price_breakdown}
                onChange={(e) => handleChange('price_breakdown', e.target.value)}
                placeholder="Labor: $X, Materials: $Y, etc..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="professional_notes">Quote Details & Notes *</label>
              <textarea
                id="professional_notes"
                className={`form-control ${errors.professional_notes ? 'is-invalid' : ''}`}
                rows="4"
                value={formData.professional_notes}
                onChange={(e) => handleChange('professional_notes', e.target.value)}
                placeholder="Explain what's included in your quote, timeline, terms, etc..."
                required
              />
              {errors.professional_notes && (
                <div className="invalid-feedback">{errors.professional_notes}</div>
              )}
            </div>
          </div>
        )}

        {/* Decline Form Fields */}
        {action === 'decline' && (
          <div className="form-section">
            <h6 className="section-title">
              <i className="flaticon-info"></i>
              Decline Information
            </h6>
            
            <div className="form-group">
              <label htmlFor="decline_reason">Reason for Declining *</label>
              <select
                id="decline_reason"
                className={`form-control ${errors.decline_reason ? 'is-invalid' : ''}`}
                value={formData.decline_reason}
                onChange={(e) => handleChange('decline_reason', e.target.value)}
                required
              >
                <option value="">Select a reason...</option>
                <option value="schedule_conflict">Schedule conflict</option>
                <option value="outside_service_area">Outside service area</option>
                <option value="insufficient_information">Need more information</option>
                <option value="not_my_expertise">Not my area of expertise</option>
                <option value="too_complex">Project too complex</option>
                <option value="too_small">Project too small</option>
                <option value="pricing_mismatch">Budget/pricing mismatch</option>
                <option value="other">Other reason</option>
              </select>
              {errors.decline_reason && (
                <div className="invalid-feedback">{errors.decline_reason}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="professional_notes">Additional Notes</label>
              <textarea
                id="professional_notes"
                className="form-control"
                rows="3"
                value={formData.professional_notes}
                onChange={(e) => handleChange('professional_notes', e.target.value)}
                placeholder="Provide more details about why you're declining..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="alternative_suggestions">Alternative Suggestions</label>
              <textarea
                id="alternative_suggestions"
                className="form-control"
                rows="3"
                value={formData.alternative_suggestions}
                onChange={(e) => handleChange('alternative_suggestions', e.target.value)}
                placeholder="Suggest other professionals, different timing, or alternative approaches..."
              />
            </div>
          </div>
        )}

        {/* Common Notes Section (for all actions) */}
        {action !== 'decline' && (
          <div className="form-section">
            <h6 className="section-title">
              <i className="flaticon-chat"></i>
              Additional Notes
            </h6>
            
            <div className="form-group">
              <label htmlFor="professional_notes">
                {action === 'quote' ? 'Additional Information' : 'Professional Notes'}
              </label>
              <textarea
                id="professional_notes"
                className="form-control"
                rows="3"
                value={formData.professional_notes}
                onChange={(e) => handleChange('professional_notes', e.target.value)}
                placeholder={
                  action === 'accept' 
                    ? "Any additional information for the customer..."
                    : "Additional details about your response..."
                }
              />
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className={`btn btn-${actionConfig.color}`}
            disabled={loading}
          >
            {loading && (
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            )}
            <i className={actionConfig.icon}></i>
            {actionConfig.submitText}
          </button>
        </div>
      </form>

      <style jsx>{`
        .appointment-interaction-form {
          background: white;
          border-radius: 12px;
          overflow: hidden;
        }

        .form-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .header-icon {
          width: 50px;
          height: 50px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .header-content {
          flex: 1;
        }

        .form-title {
          margin: 0 0 0.25rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
        }

        .form-subtitle {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .interaction-form {
          padding: 1.5rem;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section:last-child {
          margin-bottom: 1rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #f1f3f4;
          font-size: 1rem;
          font-weight: 600;
          color: #495057;
        }

        .section-title i {
          color: #6c757d;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #495057;
          font-size: 0.9rem;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          background: white;
        }

        .form-control:focus {
          outline: none;
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }

        .form-control.is-invalid {
          border-color: #dc3545;
        }

        .input-group {
          display: flex;
        }

        .input-group-text {
          padding: 0.75rem;
          background: #e9ecef;
          border: 2px solid #e9ecef;
          border-right: none;
          border-radius: 8px 0 0 8px;
          font-weight: 600;
          color: #495057;
        }

        .input-group .form-control {
          border-left: none;
          border-radius: 0 8px 8px 0;
        }

        .invalid-feedback {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.8rem;
          color: #dc3545;
        }

        .form-text {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.8rem;
          color: #6c757d;
        }

        textarea.form-control {
          resize: vertical;
          min-height: 80px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e9ecef;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #5c636a;
        }

        .btn-success {
          background: #198754;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background: #157347;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #bb2d3b;
        }

        .btn-info {
          background: #0dcaf0;
          color: white;
        }

        .btn-info:hover:not(:disabled) {
          background: #31d2f2;
        }

        .btn-primary {
          background: #0d6efd;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0b5ed7;
        }

        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
          border-width: 0.15rem;
        }

        .me-2 {
          margin-right: 0.5rem;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .form-header {
            padding: 1rem;
          }

          .header-icon {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }

          .form-title {
            font-size: 1.1rem;
          }

          .form-subtitle {
            font-size: 0.85rem;
          }

          .interaction-form {
            padding: 1rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 576px) {
          .form-header {
            padding: 0.75rem;
          }

          .interaction-form {
            padding: 0.75rem;
          }

          .form-control {
            padding: 0.6rem;
          }

          .btn {
            padding: 0.6rem 1rem;
          }
        }
      `}</style>
    </div>
  )
}
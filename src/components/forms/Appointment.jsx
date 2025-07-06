'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { createClient } from '@/utils/supabase/client'
import AppointmentAddressSelector from '@/components/forms/AppointmentAddressSelector'
// Add this import at the top with your other imports
import CustomerAvailabilityCalendar from '@/components/forms/CustomerAvailabilityCalendar'

export default function Appointment({ 
  professional, 
  serviceInformation, 
  location, 
  onSuccess, 
  onCancel 
}) {
  const { user } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(1)
  
  console.log('🔍 Appointment received location prop:', JSON.stringify(location, null, 2))
  
  const steps = useMemo(() => [
  { id: 1, title: 'Project' },
  { id: 2, title: 'Assessment' },
  { id: 3, title: 'Location' },
  { id: 4, title: 'Audit' }
], [])

  // Form state
const [formInformation, setFormInformation] = useState({
  // NEW PROJECT FIELDS
  title: serviceInformation?.name || '',      // Auto-populated from service
  description: '',                            // Customer input required
  deadline: '',                               // Customer input optional
  
  // EXISTING FIELDS
  preferred_start: '',
  urgency: 'standard',
  customer_message: '',
  use_different_address: false,
  service_location: location || {
    street_address: '',
    city: '',
    parish: '',
    community: '',
    landmark: '',
    is_rural: false,
    latitude: null,
    longitude: null,
    formatted_address: '',
    place_id: null
  }
})

  // Debug step changes
  useEffect(() => {
    console.log('📍 Step changed to:', currentStep)
    console.log('🔍 Form data:', formInformation)
    console.log('🔍 Loading state:', loading)
  }, [currentStep, formInformation, loading])

  // Update form data when location prop changes
  useEffect(() => {
    if (location) {
      console.log('📍 Customer location received in appointment form:', location)
      setFormInformation(prev => ({
        ...prev,
        service_location: location
      }))
    }
  }, [location])

  // Prevent Enter key submission except on final step
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && currentStep !== steps.length) {
        console.log('🛑 Preventing Enter key submission on step', currentStep)
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentStep, steps.length])

  useEffect(() => {
  if (serviceInformation?.name) {
    setFormInformation(prev => ({
      ...prev,
      title: serviceInformation.name
    }))
  }
}, [serviceInformation?.name])

  // Memoized urgency options
  const urgencyOptions = useMemo(() => [
    { value: 'low', label: 'Flexible (1 week)', priceMultiplier: 0.9, badge: '-10%' },
    { value: 'standard', label: 'Standard (3 days)', priceMultiplier: 1.0, badge: '' },
    { value: 'high', label: 'Priority (24hrs)', priceMultiplier: 1.2, badge: '+20%' },
    { value: 'urgent', label: 'Urgent (ASAP)', priceMultiplier: 1.5, badge: '+50%' }
  ], [])

  // Calculate estimated price
  const estimatedPrice = useMemo(() => {
    if (!serviceInformation?.base_price) return 0
    const urgencyMultiplier = urgencyOptions.find(opt => opt.value === formInformation.urgency)?.priceMultiplier || 1.0
    return (serviceInformation.base_price * urgencyMultiplier).toFixed(2)
  }, [serviceInformation?.base_price, formInformation.urgency, urgencyOptions])

  // Handle form field changes
  const handleChange = useCallback((field, value) => {
    setFormInformation(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }, [errors])

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {}
    // Project validation
  if (!formInformation.description.trim()) {
    newErrors.description = 'Project description is required'
  }
  
    
    if (!formInformation.preferred_start) {
      newErrors.preferred_start = 'Please select your preferred start time'
    } else {
      const startDate = new Date(formInformation.preferred_start)
      if (startDate <= new Date()) {
        newErrors.preferred_start = 'Start time must be in the future'
      }
    }

        if (formInformation.use_different_address) {
      if (!formInformation.service_location.street_address) {
        newErrors.street_address = 'Street address is required'
      }
      if (!formInformation.service_location.city) {
        newErrors.city = 'City is required'
      }
      if (!formInformation.service_location.parish) {
        newErrors.parish = 'Parish is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formInformation])

  // Submit form
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('📝 Form onSubmit triggered, current step:', currentStep)
    
    // Only submit if we're on the final step
    if (currentStep !== steps.length) {
      console.log('❌ Cannot submit - not on final step')
      return false
    }
    
    if (!validateForm()) return
    if (!user?.profile?.customer_id) {
      setErrors({ general: 'Please log in to make a appointment request' })
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      
      let addressId = null
      
      if (!formInformation.use_different_address) {
        const { data: customerAddress } = await supabase
          .from('address')
          .select('address_id')
          .eq('account_id', user.account.account_id)
          .eq('is_primary', true)
          .single()
        
        addressId = customerAddress?.address_id
      }

      const requestData = {
        customer_id: user.profile.customer_id,
        professional_id: professional?.professional_id || null,
        service_id: serviceInformation.service_id,
        address_id: addressId,



        // PROJECT FIELDS - NO TITLE (comes from service)
  description: formInformation.description,  // ✅ Customer input
  deadline: formInformation.deadline || null, // ✅ Customer input
  

        preferred_start: formInformation.preferred_start,
        urgency: formInformation.urgency,
        customer_message: formInformation.customer_message || null,
        service_location: formInformation.use_different_address ? {
          ...formInformation.service_location,
          latitude: location?.lat,
          longitude: location?.lng,
          formatted_address: `${formInformation.service_location.street_address}, ${formInformation.service_location.city}, ${formInformation.service_location.parish}`
        } : null
      }

      console.log('🚀 Submitting appointment request:', requestData)

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create appointment request')
      }

      console.log('✅ appointment request created:', result.appointment)
      onSuccess?.(result.appointment)

    } catch (error) {
      console.error('❌ appointment request error:', error)
      setErrors({ general: error.message })
    } finally {
      setLoading(false)
    }
  }, [formInformation, validateForm, user, professional, serviceInformation, location, onSuccess, currentStep, steps.length])

  // Step navigation
  const nextStep = useCallback((e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (currentStep < steps.length) {
      console.log(`📍 Moving from step ${currentStep} to step ${currentStep + 1}`)
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, steps.length])

  const prevStep = useCallback((e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (currentStep > 1) {
      console.log(`📍 Moving from step ${currentStep} to step ${currentStep - 1}`)
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= steps.length) {
      setCurrentStep(stepNumber)
    }
  }, [steps.length])

  // Check if current step is valid for navigation
  const isStepValid = useCallback((step) => {
  switch (step) {
    case 1: return formInformation.description.trim() !== '' 
    case 2: return formInformation.preferred_start !== ''         // Schedule step
    case 3: return !formInformation.use_different_address || (   // Location step
      formInformation.service_location.street_address &&
      formInformation.service_location.city &&
      formInformation.service_location.parish
    )
    case 4: return true                                    // Audit step
    default: return false
  }
}, [formInformation])

  // Calculate progress percentage
  const calculateProgress = useCallback(() => {
    return ((currentStep - 1) / (steps.length - 1)) * 100
  }, [currentStep, steps.length])

  // Get step status helper
  const getStepStatus = useCallback((stepId) => {
    if (currentStep > stepId) return 'completed'
    if (currentStep === stepId) return 'active'
    if (isStepValid(stepId)) return 'available'
    return 'pending'
  }, [currentStep, isStepValid])

  // Get minimum date (tomorrow)
  const minDateTime = useMemo(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().slice(0, 16)
  }, [])

  return (
    <div className="appointment-form">
      {/* Linear Step Indicator */}
      <div className="linear-step-indicator">
        {/* Progress Header */}
        <div className="progress-header">
          {/* <h4>{steps[currentStep - 1]?.title}</h4> */}
          {/* <span className="step-counter"> {currentStep} of {steps.length}</span> */}
        </div>

        {/* Progress Bar Container */}
        <div className="progress-container">
          {/* Background Track */}
          <div className="progress-track">
            {/* Active Progress Fill */}
            <div 
              className="progress-fill" 
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>

          {/* Step Labels */}
          <div className="steps-labels">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`step-label ${getStepStatus(step.id)}`}
                onClick={() => isStepValid(step.id) && goToStep(step.id)}
              >
                
                <span className="step-text">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="form-container"
        autoComplete="off"
      >

        {currentStep === 1 && (
  <div className="form-step">
        
    <div className="form-grid">
      <div className="form-group full-width">
        <label>Tell us what you need *</label>
        <textarea
          className={`form-textarea ${errors.description ? 'error' : ''}`}
          rows="4"
          value={formInformation.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe what you need done in detail..."
          required
        />
        {errors.description && <span className="error-text">{errors.description}</span>}
      </div>

            <div className="form-group">
        <label>When do you want the service to be done?   (Optional)</label>
        <input
          type="date"
          className={`form-input ${errors.deadline ? 'error' : ''}`}
          value={formInformation.deadline}
          onChange={(e) => handleChange('deadline', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
        {errors.deadline && <span className="error-text">{errors.deadline}</span>}
      </div>
    </div>
  </div>
)}

        {/* Step 1: Schedule */}
       {currentStep === 2 && (
  <div className="form-step">
    {/* <h4 className="step-title">When can we assess your project?</h4> */}
    
    {errors.general && (
      <div className="error-alert">{errors.general}</div>
    )}

    {/* Assessment Information */}
    {/* <div className="assessment-info">
      <div className="info-card">
        <h6>📋 What happens during the assessment?</h6>
        <ul>
          <li>Professional reviews your project requirements</li>
          <li>Takes measurements and photos if needed</li>
          <li>Discusses timeline and materials</li>
          <li>Provides detailed quote within 24 hours</li>
        </ul>
        <p className="duration-note">⏱️ Assessment takes approximately 1 hour</p>
      </div>
    </div> */}

    {/* Professional's Available Slots */}
    <div className="calendar-section">
      <label className="calendar-label">Select an available time slot:</label>
      
      <CustomerAvailabilityCalendar
        professionalId={professional?.professional_id}
        onSlotSelect={(datetime) => handleChange('preferred_start', datetime)}
        selectedSlot={formInformation.preferred_start}
      />
      
      {errors.preferred_start && (
        <span className="error-text">{errors.preferred_start}</span>
      )}
    </div>

    {/* Urgency Level - Keep this */}
    {/* <div className="form-group full-width urgency-section">
      <label>How urgent is this project?</label>
      <div className="urgency-grid">
        {urgencyOptions.map(option => (
          <div 
            key={option.value}
            className={`urgency-option ${formInformation.urgency === option.value ? 'selected' : ''}`}
            onClick={() => handleChange('urgency', option.value)}
          >
            <div className="urgency-label">{option.label}</div>
            {option.badge && (
              <div className={`urgency-badge ${option.priceMultiplier > 1 ? 'premium' : 'discount'}`}>
                {option.badge}
              </div>
            )}
          </div>
        ))}
      </div>
    </div> */}
  </div>
)}

        {/* Step 2: Location */}
        {currentStep === 3 && (
          <div className="form-step">
            <h4 className="step-title">Where should the service be performed?</h4>

            <div className="location-toggle">
              <label className="toggle-option">
                <input 
                  type="checkbox" 
                  checked={formInformation.use_different_address}
                  onChange={(e) => handleChange('use_different_address', e.target.checked)}
                />
                <div className="toggle-content">
                  <div className="toggle-title">Use a different address for this service</div>
                  <div className="toggle-description">
                    {formInformation.use_different_address 
                      ? 'Select or enter the service location below'
                      : 'We\'ll use your account\'s primary address'
                    }
                  </div>
                </div>
              </label>
            </div>

            {!formInformation.use_different_address && (
              <div className="location-info">
                📍 Service will be performed at: {formInformation.service_location?.formatted_address || 'your confirmed location'}
              </div>
            )}

            {formInformation.use_different_address && (
              <AppointmentAddressSelector
                onAddressSelect={(address) => {
                  setFormInformation(prev => ({
                    ...prev,
                    service_location: address
                  }))
                }}
                currentAddress={formInformation.service_location}
              />
            )}
          </div>
        )}

        {/* Step 3: Audit */}
        {currentStep === 4 && (
          <div className="form-step">
            <h4 className="step-title">Is this what you want?</h4>

            <div className="audit-summary">
              <div className="summary-section">
                <h6>Service Details</h6>
                <div className="detail-grid">
                  <div>
                    <strong>Start:</strong> {new Date(formInformation.preferred_start).toLocaleString()}
                  </div>
                  {formInformation.preferred_end && (
                    <div>
                      <strong>End:</strong> {new Date(formInformation.preferred_end).toLocaleString()}
                    </div>
                  )}
                  <div>
                    <strong>Urgency:</strong> {urgencyOptions.find(opt => opt.value === formInformation.urgency)?.label}
                  </div>
                  <div className="price-highlight">
                    <strong>Total:</strong> JMD ${estimatedPrice}
                  </div>
                </div>
              </div>

              {formInformation.use_different_address && formInformation.service_location.street_address && (
                <div className="summary-section">
                  <h6>Service Location</h6>
                  <div className="location-display">
                    {formInformation.service_location.street_address}, {formInformation.service_location.city}, {formInformation.service_location.parish}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Additional Message (Optional)</label>
              <textarea
                className="form-textarea"
                rows="3"
                value={formInformation.customer_message}
                onChange={(e) => handleChange('customer_message', e.target.value)}
                placeholder="Any special instructions or requirements..."
              />
            </div>

            {errors.general && (
              <div className="error-alert">{errors.general}</div>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          {currentStep > 1 && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={prevStep}
            >
              ← Back
            </button>
          )}
          
          {currentStep === 1 && (
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={(e) => {
                e.preventDefault()
                onCancel()
              }}
            >
              Cancel
            </button>
          )}

          {currentStep < steps.length ? (
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
            >
              Continue →
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
              onClick={(e) => {
                console.log('🚀 Submit button clicked')
                // handleSubmit will be called by form onSubmit
              }}
            >
              {loading ? (
                <>⏳ Creating Request...</>
              ) : (
                <>🚀 Send appointment Request</>
              )}
            </button>
          )}
        </div>
      </form>

      <style jsx>{`
        .appointment-form {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: white;
        }

        /* Linear Step Indicator */
        .linear-step-indicator {
          padding: 0.5rem;
          // background: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        // .progress-header h4 {
        //   margin: 0;
        //   font-size: 18px;
        //   font-weight: 600;
        //   color: #495057;
        // }

        .step-counter {
          font-size: 14px;
          color: #6c757d;
          font-weight: 500;
        }

        .service-title-display {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          text-align: center;
        }

        .service-title-display h5 {
          margin: 0;
          color: #0c4a6e;
          font-size: 18px;
          font-weight: 600;
        }

        /* Progress Bar Styles */
        .progress-container {
          position: relative;
          margin-bottom: 1rem;
        }

        .progress-track {
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0d6efd 0%, #6610f2 100%);
          border-radius: 4px;
          transition: width 0.4s ease;
        }

        /* Step Labels - Simplified without circular markers */
        .steps-labels {
          position: relative;
          margin-top: 1rem;
          height: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .step-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          position: relative;
        }

        .step-label:hover {
          transform: translateY(-2px);
        }

        .step-text {
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          transition: all 0.2s ease;
        }

        /* Step States - Text only */
        .step-label.pending .step-text {
          color: #6c757d;
        }

        .step-label.available .step-text {
          color: #856404;
          font-weight: 600;
        }

        .step-label.active .step-text {
          color: #0d6efd;
          font-weight: 700;
          font-size: 15px;
        }

        .step-label.completed .step-text {
          color: #198754;
          font-weight: 600;
        }

        /* Optional: Add underline indicator for active step */
        .step-label.active::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 3px;
          background: #0d6efd;
          border-radius: 2px;
        }

        /* Form Container */
        .form-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .form-step {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
        }

        .step-title {
          // font-size: 20px;
          // font-weight: 600;
          // color: #212529;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        /* Form Elements */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-weight: 600;
          font-size: 14px;
          color: #495057;
          margin-bottom: 6px;
        }

        .form-input, .form-textarea {
          padding: 10px 12px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #0d6efd;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.15);
        }

        .form-input.error {
          border-color: #dc3545;
        }

        .error-text {
          color: #dc3545;
          font-size: 12px;
          margin-top: 4px;
        }

        .error-alert {
          background: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 14px;
        }

        /* Urgency Options */
        .urgency-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .urgency-option {
          padding: 12px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          position: relative;
        }

        .urgency-option:hover {
          border-color: #0d6efd;
          transform: translateY(-2px);
        }

        .urgency-option.selected {
          border-color: #0d6efd;
          background: #f0f9ff;
        }

        .urgency-label {
          font-weight: 600;
          font-size: 13px;
          color: #495057;
        }

        .urgency-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 700;
        }

        .urgency-badge.premium {
          background: #dc3545;
          color: white;
        }

        .urgency-badge.discount {
          background: #198754;
          color: white;
        }

        /* Location Toggle */
        .location-toggle {
          margin-bottom: 1.5rem;
        }

        .toggle-option {
          display: flex;
          align-items: flex-start;
          padding: 1rem;
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-option:hover {
          border-color: #0d6efd;
          background: #f0f9ff;
        }

        .toggle-option input[type="checkbox"] {
          margin-right: 12px;
          margin-top: 2px;
          transform: scale(1.2);
        }

        .toggle-content {
          flex: 1;
        }

        .toggle-title {
          font-weight: 600;
          color: #495057;
          margin-bottom: 4px;
        }

        .toggle-description {
          font-size: 13px;
          color: #6c757d;
        }

        .location-info {
          background: #d1ecf1;
          color: #0c5460;
          padding: 1rem;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 1rem;
        }

        /* Audit Summary */
        .audit-summary {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid #e9ecef;
        }

        .summary-section {
          margin-bottom: 1.5rem;
        }

        .summary-section:last-child {
          margin-bottom: 0;
        }

        .summary-section h6 {
          margin-bottom: 1rem;
          color: #495057;
          font-weight: 700;
          font-size: 16px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          font-size: 14px;
        }

        .detail-grid > div {
          padding: 8px 0;
        }

        .price-highlight {
          grid-column: 1 / -1;
          padding: 12px;
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          border-radius: 8px;
          border: 1px solid #198754;
          text-align: center;
          font-size: 16px;
        }

        .location-display {
          background: white;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #dee2e6;
          font-size: 14px;
          color: #495057;
        }

        /* Form Actions */
        .form-actions {
          padding: 1rem 1.5rem;
          background: #f8f9fa;
          border-top: 1px solid #dee2e6;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn:hover {
          transform: translateY(-1px);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-primary {
          background: #0d6efd;
          color: white;
        }

        .btn-primary:hover {
          background: #0b5ed7;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5c636a;
        }

        .btn-success {
          background: #198754;
          color: white;
          padding: 12px 24px;
          font-size: 16px;
        }

        .btn-success:hover {
          background: #157347;
        }

        .btn-outline {
          background: transparent;
          color: #6c757d;
          border: 2px solid #e9ecef;
        }

        .btn-outline:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .linear-step-indicator {
            padding: 1rem;
          }

          .progress-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
          }

          .progress-header h4 {
            font-size: 16px;
          }

          .step-counter {
            font-size: 12px;
          }

          .progress-track {
            height: 6px;
          }

          .steps-labels {
            height: 25px;
            margin-top: 0.75rem;
          }

          .step-text {
            font-size: 12px;
          }

          .step-label.active .step-text {
            font-size: 13px;
          }

          .form-step {
            padding: 1rem;
          }

          .step-title {
            font-size: 18px;
            margin-bottom: 1rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .urgency-grid {
            grid-template-columns: 1fr;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            padding: 0.75rem 1rem;
            flex-direction: column;
            gap: 8px;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 576px) {
          .linear-step-indicator {
            padding: 0.75rem;
          }

          .progress-header h4 {
            font-size: 14px;
          }

          .step-counter {
            font-size: 11px;
          }

          .progress-track {
            height: 4px;
          }

          .steps-labels {
            height: 20px;
            margin-top: 0.5rem;
          }

          .step-text {
            font-size: 11px;
          }

          .step-label.active .step-text {
            font-size: 12px;
          }

          /* On very small screens, consider showing only current step */
          .step-label:not(.active) .step-text {
            opacity: 0.6;
            font-size: 10px;
          }

          .form-step {
            padding: 0.75rem;
          }

          .audit-summary {
            padding: 1rem;
          }
        }

        /* Scrollbar Styling */
        .form-step::-webkit-scrollbar {
          width: 6px;
        }

        .form-step::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .form-step::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .form-step::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Assessment Information Styles */
.assessment-info {
  margin-bottom: 2rem;
}

.info-card {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.info-card h6 {
  margin: 0 0 1rem 0;
  color: #0c4a6e;
  font-size: 16px;
  font-weight: 600;
}

.info-card ul {
  margin: 0 0 1rem 0;
  padding-left: 1.2rem;
}

.info-card li {
  margin-bottom: 0.5rem;
  color: #0c4a6e;
  font-size: 14px;
}

.duration-note {
  margin: 0;
  font-size: 13px;
  color: #0369a1;
  font-weight: 500;
  text-align: center;
  padding: 0.5rem;
  background: rgba(3, 105, 161, 0.1);
  border-radius: 6px;
}

/* Calendar Section */
.calendar-section {
  margin-bottom: 2rem;
}

.calendar-label {
  display: block;
  font-weight: 600;
  font-size: 14px;
  color: #495057;
  margin-bottom: 1rem;
}

/* Urgency Section - Updated */
.urgency-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.urgency-section label {
  margin-bottom: 1rem;
  font-size: 15px;
}

/* Mobile Responsive for Assessment Info */
@media (max-width: 768px) {
  .info-card {
    padding: 1rem;
  }
  
  .info-card h6 {
    font-size: 14px;
  }
  
  .info-card li {
    font-size: 13px;
  }
  
  .duration-note {
    font-size: 12px;
  }
}
  
      `}</style>
    </div>
  )
}
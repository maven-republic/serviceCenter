// app/(auth)/register/customer/CustomerAccountCreationForm.jsx
'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { signupCustomer, checkEmailExists } from './actions'
import Address from './Address'


export default function CustomerAccountCreationForm({ errorMessage }) {
  // const searchParamsResolved = await searchParams;
  // const errorMessage = searchParamsResolved?.error || null;

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    password: '',
    confirmPassword: '',

    formattedAddress: '',
    placeId: '',
    latitude: '',
    longitude: '',
    street: '',
    city: '',
    parish: '',
    country: '',
    rawGoogleData: null
  })
  
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    password: '',
    confirmPassword: ''
  })
  
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [touchedFields, setTouchedFields] = useState({})
  const [focusedField, setFocusedField] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Update form data
  const updateFormData = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Mark field as touched
    setTouchedFields(prev => ({ ...prev, [name]: true }))
    
    // Clear error when user is typing if the input now passes validation
    const error = validateField(name, value)
    if (!error) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Handle field focus
  const handleFocus = (e) => {
    setFocusedField(e.target.name)
  }

  // Handle field blur
  const handleBlur = (e) => {
    const { name, value } = e.target
    setFocusedField(null)
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  // Validate a specific field
  const validateField = (name, value) => {
    let error = ''
    
    switch (name) {
      case 'firstName':
        if (!value.trim()) error = 'First name is required'
        else if (value.length < 2) error = 'First name must be at least 2 characters'
        break
        
      case 'lastName':
        if (!value.trim()) error = 'Last name is required'
        else if (value.length < 2) error = 'Last name must be at least 2 characters'
        break
        
      case 'email':
        if (!value) {
          error = 'Email is required'
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) error = 'Please enter a valid email address'
        }
        break
        
      case 'phone':
        if (!value) {
          error = 'Phone number is required'
        } else {
          // Allow formats like: 1234567890, 123-456-7890, (123) 456-7890
          const phoneRegex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
          if (!phoneRegex.test(value)) error = 'Please enter a valid phone number'
        }
        break
        
      case 'gender':
        if (!value) error = 'Please select a gender'
        break
        
      case 'password':
        if (!value) {
          error = 'Password is required'
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters'
        } else if (!/[A-Z]/.test(value)) {
          error = 'Password must contain at least one uppercase letter'
        } else if (!/[a-z]/.test(value)) {
          error = 'Password must contain at least one lowercase letter'
        } else if (!/[0-9]/.test(value)) {
          error = 'Password must contain at least one number'
        } else if (!/[^A-Za-z0-9]/.test(value)) {
          error = 'Password must contain at least one special character'
        }
        break
        
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password'
        } else if (value !== formData.password) {
          error = 'Passwords do not match'
        }
        break
        
      default:
        break
    }
    
    return error
  }

  // Calculate password strength on password change
  useEffect(() => {
    const password = formData.password
    let strength = 0
    
    if (password.length > 0) strength += 1
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    
    setPasswordStrength(strength)
    
    // Also validate confirm password field if it has a value
    if (formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: validateField('confirmPassword', formData.confirmPassword)
      }))
    }
  }, [formData.password])

  const checkEmail = async (email) => {
    // Create an actual FormData object
    const data = new FormData()
    data.append('email', email)
    
    const { exists, error } = await checkEmailExists(data)
    
    if (exists) {
      return 'This email is already registered. Please use a different email or login.'
    }
    
    if (error) {
      return 'Error checking email. Please try again.'
    }
    
    return ''
  }

  // Validate fields before moving to next step
  const validateStep = async (step) => {
    let isValid = true
    let newErrors = { ...errors }
    
    if (step === 1) {
      // Validate email and password fields
      let emailError = validateField('email', formData.email)
      const passwordError = validateField('password', formData.password)
      const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword)
      
      // Only check for duplicate email if the format is valid
      if (!emailError && formData.email) {
        // Set loading state or disable button while checking
        const emailExistsError = await checkEmail(formData.email)
        if (emailExistsError) {
          emailError = emailExistsError
        }
      }
      
      newErrors.email = emailError
      newErrors.password = passwordError
      newErrors.confirmPassword = confirmPasswordError
      
      if (emailError || passwordError || confirmPasswordError) {
        isValid = false
      }
    } else if (step === 2) {
      // Validate name and gender fields
      const firstNameError = validateField('firstName', formData.firstName)
      const lastNameError = validateField('lastName', formData.lastName)
      const genderError = validateField('gender', formData.gender)
      
      newErrors.firstName = firstNameError
      newErrors.lastName = lastNameError
      newErrors.gender = genderError
      
      if (firstNameError || lastNameError || genderError) {
        isValid = false
      }
    }
    
    setErrors(newErrors)
    return isValid
  }

  const [isChecking, setIsChecking] = useState(false)

  const nextStep = async () => {
    setIsChecking(true)
    
    // Mark all fields for current step as touched to show validation errors
    if (currentStep === 1) {
      setTouchedFields(prev => ({
        ...prev,
        email: true,
        password: true,
        confirmPassword: true
      }))
    } else if (currentStep === 2) {
      setTouchedFields(prev => ({
        ...prev,
        firstName: true,
        lastName: true,
        gender: true
      }))
    } else if (currentStep === 3) {
      // Mark phone field as touched
setTouchedFields(prev => ({
  ...prev,
  phone: true
}))
    }
    
    const isValid = await validateStep(currentStep)
    setIsChecking(false)
    
    if (isValid) {
      // Add animation before changing step
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(prev => prev + 1)
        setIsAnimating(false)
      }, 300) // Match this with the CSS animation duration
    }
  }
  
  
  const prevStep = () => {
    // Add animation before changing step
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentStep(prev => prev - 1)
      setIsAnimating(false)
    }, 300) // Match this with the CSS animation duration
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Mark phone field as touched
    setTouchedFields(prev => ({
      ...prev,
      phone: true
    }))
    
    // Validate final step
    const phoneError = validateField('phone', formData.phone)
    setErrors(prev => ({ ...prev, phone: phoneError }))
    
    if (phoneError) {
      return
    }
    
    // Create FormData object to pass to server action
    const submitData = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'rawGoogleData') {
        submitData.append(key, JSON.stringify(value || {}))
      } else {
        submitData.append(key, value)
      }
    })
    
    
    // Submit to server action
    await signupCustomer(submitData)
  }

  // Get strength color and text
  const getPasswordStrengthInfo = () => {
    if (formData.password.length === 0) return { color: 'bg-gray-200', text: '' }
    
    switch (passwordStrength) {
      case 1:
        return { color: 'bg-red-500', text: 'Very Weak' }
      case 2:
        return { color: 'bg-red-400', text: 'Weak' }
      case 3:
        return { color: 'bg-yellow-500', text: 'Fair' }
      case 4:
        return { color: 'bg-yellow-400', text: 'Good' }
      case 5:
        return { color: 'bg-green-400', text: 'Strong' }
      case 6:
        return { color: 'bg-green-500', text: 'Very Strong' }
      default:
        return { color: 'bg-gray-200', text: '' }
    }
  }
  
  const strengthInfo = getPasswordStrengthInfo()
  
  // Helper function to determine if a field has content or is focused
  const isActive = (name) => {
    return !!formData[name] || focusedField === name
  }
  
  return (
    <div className="container-fluid py-5">
      <div className="row">
        {/* Left Column - Content */}
        <div className="col-lg-6 wow fadeInLeft" data-wow-delay="300ms">
           <div className="left-content p-4 p-lg-5">
            <h2 className="title mb-4">Workers you can trust</h2>
            
           {/* <div className="mb-5">
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="feature-icon mb-3">
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <h5>Honest work</h5>
                  <p className="mb-0 text-muted">Every professional is thoroughly vetted for quality and reliability.</p>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="feature-icon mb-3">
                    <i className="fas fa-credit-card-front"></i>
                  </div>
                  <h5>Safe payment</h5>
                  <p className="mb-0 text-muted">Book services within minutes, not days.</p>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="feature-icon mb-3">
                    <i className="fas fa-window-frame"></i>
                  </div>
                  <h5>Clarity</h5>
                  <p className="mb-0 text-muted">No sudden fees - clear pricing.</p>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="feature-icon mb-3">
                    <i className="fas fa-list-radio"></i>
                  </div>
                  <h5>Selection </h5>
                  <p className="mb-0 text-muted">Select from the 1% of professionals.</p>
                </div>
              </div>
            </div> */}
          

          <div className="row">
  {[
    {
      icon: 'fas fa-user-tie',
      title: 'Honest work',
      desc: 'Every professional is thoroughly vetted for quality and reliability.'
    },
    {
      icon: 'fas fa-credit-card-front',
      title: 'Safe payment',
      desc: 'Book services within minutes, not days.'
    },
    {
      icon: 'fas fa-window-frame',
      title: 'Clarity',
      desc: 'No sudden fees - clear pricing.'
    },
    {
      icon: 'fas fa-list-radio',
      title: 'Selection',
      desc: 'Select from the 1% of professionals.'
    }
  ].map((feature, index) => (
    <div key={index} className="col-md-6 mb-4">
      <div className="feature-icon mb-3">
        <i className={feature.icon}></i>
      </div>
      <h5>{feature.title}</h5>
      <p className="mb-0 text-muted">{feature.desc}</p>
    </div>
  ))}
</div>
</div>

        </div>


        {/* right column */}

        <div className="col-lg-6 wow fadeInRight" data-wow-delay="300ms">


    <form onSubmit={currentStep === 4 ? handleSubmit : e => e.preventDefault()}>
      <div className="container">
        <div className="row">
          <div className="main-title text-center mb-4">
              <h2 className="title">Create an Account</h2>
            </div>
        </div>
        
       {/* Progress indicator */}
       <div className="progress-container mb-4">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                ></div>
              </div>
              <div className="progress-steps">
                <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
                  <div className="step-circle">1</div>
                  <span className="step-label">Account</span>
                </div>
                <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
                  <div className="step-circle">2</div>
                  <span className="step-label">Identity</span>
                </div>
                <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
                  <div className="step-circle">3</div>
                  <span className="step-label">Contact</span>
                </div>

                <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>
                  <div className="step-circle">4</div>
                  <span className="step-label">Address</span>
                </div>
          
              </div>
            </div>
            <div className="log-reg-form search-modal form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
              {/* Step content with animation */}
              <div className={`step-content ${isAnimating ? 'fade-out' : 'fade-in'}`}>
                {currentStep === 1 && (
                  // Account Step
                  <>
                    <div className="mb30">
                      <h4>Create your customer account</h4>
                      <p className="text mt20">
                        Already have an account?{" "}
                        <Link href="/login" className="text-thm">
                          Log In!
                        </Link>
                      </p>
                    </div>
                    
                    <div className="mb25 form-floating">
                      <input
                        name="email"
                        type="email"
                        id="emailInput"
                        value={formData.email}
                        onChange={updateFormData}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={`form-control ${errors.email && touchedFields.email ? 'is-invalid' : ''} ${isActive('email') ? 'has-value' : ''}`}
                        placeholder=" "
                      />
                      <label htmlFor="emailInput" className="form-label fw500 dark-color">Email</label>
                      {errors.email && touchedFields.email && (
                        <div className="invalid-feedback d-block">{errors.email}</div>
                      )}
                      <small className="form-text text-muted">We'll never share your email with anyone else.</small>
                    </div>
                    
                    <div className="mb15 form-floating password-field">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        id="passwordInput"
                        value={formData.password}
                        onChange={updateFormData}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={`form-control ${errors.password && touchedFields.password ? 'is-invalid' : ''} ${isActive('password') ? 'has-value' : ''}`}
                        placeholder=" "
                        
                      />
                      <button 
                        type="button" 
                        className="password-toggle" 
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex="-1"
                        style={{ display: errors.password && touchedFields.password ? 'none' : 'flex' }}
                      >
                        <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                      <label htmlFor="passwordInput" className="form-label fw500 dark-color">Password</label>
                      {errors.password && touchedFields.password && (
                        <div className="invalid-feedback d-block">{errors.password}</div>
                      )}
                      
                      {/* Password strength meter */}
                      {formData.password && (
                        <div className="mt-2">
                          <div className="strength-meter">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${strengthInfo.color}`} 
                                style={{ width: `${(passwordStrength / 6) * 100}%` }}
                              ></div>
                            </div>
                            <span className="strength-text">{strengthInfo.text}</span>
                          </div>
                          <small className="form-text text-muted">
                            Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                          </small>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb25 form-floating password-field">
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPasswordInput"
                        value={formData.confirmPassword}
                        onChange={updateFormData}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={`form-control ${errors.confirmPassword && touchedFields.confirmPassword ? 'is-invalid' : ''} ${isActive('confirmPassword') ? 'has-value' : ''}`}
                        placeholder=" "
                      />
                      <button 
                        type="button" 
                        className="password-toggle" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex="-1"
                        style={{ display: errors.confirmPassword && touchedFields.confirmPassword ? 'none' : 'flex' }}
                      >
                        <i className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                      <label htmlFor="confirmPasswordInput" className="form-label fw500 dark-color">Confirm Password</label>
                      {errors.confirmPassword && touchedFields.confirmPassword && (
                        <div className="invalid-feedback d-block">{errors.confirmPassword}</div>
                      )}
                    </div>
                    
                    <div className="d-grid">
                      <button
                        className="ud-btn btn-thm default-box-shadow2"
                        type="button"
                        onClick={nextStep}
                        disabled={isChecking || isAnimating}
                      >
                        {isChecking ? (
                          <span>Checking... <i className="fas fa-spinner fa-spin"></i></span>
                        ) : (
                          <span>Continue <i className="fal fa-arrow-right-long"></i></span>
                        )}
                      </button>
                    </div>
                  </>
                )}
                
                {currentStep === 2 && (
                  // Profile Step
                  <>
                    <div className="mb30">
                      <h4>Your Profile</h4>
                    </div>
                    
                    <div className="mb25 form-floating">
                      <input
                        name="firstName"
                        type="text"
                        id="firstNameInput"
                        value={formData.firstName}
                        onChange={updateFormData}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={`form-control ${errors.firstName && touchedFields.firstName ? 'is-invalid' : ''} ${isActive('firstName') ? 'has-value' : ''}`}
                        placeholder=" "
                      />
                      <label htmlFor="firstNameInput" className="form-label fw500 dark-color">First Name</label>
                      {errors.firstName && touchedFields.firstName && (
                        <div className="invalid-feedback d-block">{errors.firstName}</div>
                      )}
                    </div>
                    
                    <div className="mb25 form-floating">
                      <input
                        name="lastName"
                        type="text"
                        id="lastNameInput"
                        value={formData.lastName}
                        onChange={updateFormData}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={`form-control ${errors.lastName && touchedFields.lastName ? 'is-invalid' : ''} ${isActive('lastName') ? 'has-value' : ''}`}
                        placeholder=" "
                        
                      />
                      <label htmlFor="lastNameInput" className="form-label fw500 dark-color">Last Name</label>
                      {errors.lastName && touchedFields.lastName && (
                        <div className="invalid-feedback d-block">{errors.lastName}</div>
                      )}
                    </div>
                    
                    <div className="mb25 form-floating">
                      <select
                        name="gender"
                        id="genderSelect"
                        value={formData.gender}
                        onChange={updateFormData}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={`form-control ${errors.gender && touchedFields.gender ? 'is-invalid' : ''} ${isActive('gender') ? 'has-value' : ''}`}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      <label htmlFor="genderSelect" className="form-label fw500 dark-color">Gender</label>
                      {errors.gender && touchedFields.gender && (
                        <div className="invalid-feedback d-block">{errors.gender}</div>
                      )}
                    </div>
                    
                    <div className="d-flex justify-content-between">
                      <button
                        className="ud-btn btn-white"
                        type="button"
                        onClick={prevStep}
                        disabled={isAnimating}
                      >
                        <i className="fal fa-arrow-left-long"></i> Back
                      </button>
                      <button
                        className="ud-btn btn-thm default-box-shadow2"
                        type="button"
                        onClick={nextStep}
                        disabled={isAnimating}
                      >
                        Continue <i className="fal fa-arrow-right-long" />
                      </button>
                    </div>
                  </>
                )}
                
                {currentStep === 3 && (
                  // Contact Step
                  <>
                    <div className="mb30">
                      <h4>Contact Information</h4>
                    </div>
                    
                    <div className="mb25 form-floating">
                      <input
                        name="phone"
                        type="tel"
                        id="phoneInput"
                        value={formData.phone}
                        onChange={updateFormData}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={`form-control ${errors.phone && touchedFields.phone ? 'is-invalid' : ''} ${isActive('phone') ? 'has-value' : ''}`}
                        placeholder=" "
                      />
                      <label htmlFor="phoneInput" className="form-label fw500 dark-color">Phone Number</label>
                      {errors.phone && touchedFields.phone && (
                        <div className="invalid-feedback d-block">{errors.phone}</div>
                      )}
                      <small className="form-text text-muted">
                        Format: 123-456-7890 or (123) 456-7890
                      </small>
                    </div>
                    <div className="d-flex justify-content-between">
                      <button
                        className="ud-btn btn-white"
                        type="button"
                        onClick={prevStep}
                        disabled={isAnimating}
                      >
                        <i className="fal fa-arrow-left-long"></i> Back
                      </button>
                      <button
                        className="ud-btn btn-thm default-box-shadow2"
                        type="button"
                        onClick={nextStep}
                        disabled={isAnimating}
                      >
                        Continue <i className="fal fa-arrow-right-long" />
                      </button>
                    </div>
                  </>
                )}

{currentStep === 4 && (
  <>
    <div className="mb30">
      <h4>Address Information</h4>
    </div>

    <Address onSelect={(place) => {
      const getComponent = (type) =>
        place.address_components?.find(c => c.types.includes(type))?.long_name || ''

      const location = place.geometry.location

      const updatedAddress = {
        formattedAddress: place.formatted_address,
        placeId: place.place_id,
        latitude: location.lat(),
        longitude: location.lng(),
        street: getComponent('route'),
        city: getComponent('locality') || getComponent('sublocality'),
        parish: getComponent('administrative_area_level_1'),
        country: getComponent('country'),
        rawGoogleData: place
      }

      setFormData(prev => ({ ...prev, ...updatedAddress }))
    }} />

    <div className="d-flex justify-content-between">
      <button
        className="ud-btn btn-white"
        type="button"
        onClick={prevStep}
        disabled={isAnimating}
      >
        <i className="fal fa-arrow-left-long"></i> Back
      </button>
      <button
        className="ud-btn btn-thm default-box-shadow2"
        type="submit"
        disabled={isAnimating}
      >
        Create Account <i className="fal fa-arrow-right-long" />
      </button>
    </div>
  </>
)}


              </div>
              
              {errorMessage && (
                <div className="alert alert-danger mt-3" role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {errorMessage}
                </div>
              )}
            </div>
      </div>
    </form>
    </div>
    </div>
    </div>
  )
}
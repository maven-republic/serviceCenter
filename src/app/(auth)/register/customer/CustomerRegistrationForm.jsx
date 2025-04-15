// app/(auth)/register/customer/CustomerRegistrationForm.jsx
'use client'

import { useState } from 'react'
import Link from "next/link"
import { signupCustomer } from './actions'

export default function CustomerRegistrationForm({ errorMessage }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    password: '',
    confirmPassword: ''
    // Add other customer-specific fields
  })

  const updateFormData = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const nextStep = () => setCurrentStep(prev => prev + 1)
  const prevStep = () => setCurrentStep(prev => prev - 1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Create FormData object to pass to server action
    const submitData = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value)
    })
    
    // Submit to server action
    await signupCustomer(submitData)
  }
  
  return (
    <form onSubmit={currentStep === 3 ? handleSubmit : e => e.preventDefault()}>
      <div className="container">
        <div className="row">
          <div className="col-lg-6 m-auto wow fadeInUp" data-wow-delay="300ms">
            <div className="main-title text-center">
              <h2 className="title">Create an Account</h2>
            </div>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="row mb-4">
          <div className="col-lg-6 mx-auto">
            <div className="d-flex justify-content-between">
              <div className={`step-indicator ${currentStep >= 1 ? 'active' : ''}`}>Account</div>
              <div className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}>Profile</div>
              <div className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}>Contact</div>
            </div>
          </div>
        </div>
        
        <div className="row wow fadeInRight" data-wow-delay="300ms">
          <div className="col-xl-6 mx-auto">
            <div className="log-reg-form search-modal form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
              {/* Step content */}
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
                  
                  <div className="mb25">
                    <label className="form-label fw500 dark-color">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={updateFormData}
                      className="form-control"
                      placeholder="johndoe@email.com"
                      required
                    />
                  </div>
                  
                  <div className="mb15">
                    <label className="form-label fw500 dark-color">Password</label>
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={updateFormData}
                      className="form-control"
                      placeholder=""
                      required
                    />
                  </div>
                  
                  <div className="mb25">
                    <label className="form-label fw500 dark-color">Confirm Password</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={updateFormData}
                      className="form-control"
                      placeholder=""
                      required
                    />
                  </div>
                  
                  <div className="d-grid">
                    <button
                      className="ud-btn btn-thm default-box-shadow2"
                      type="button"
                      onClick={nextStep}
                    >
                      Continue <i className="fal fa-arrow-right-long" />
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
                  
                  <div className="mb25">
                    <label className="form-label fw500 dark-color">First Name</label>
                    <input
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={updateFormData}
                      className="form-control"
                      placeholder="John"
                      required
                    />
                  </div>
                  
                  <div className="mb25">
                    <label className="form-label fw500 dark-color">Last Name</label>
                    <input
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={updateFormData}
                      className="form-control"
                      placeholder="Doe"
                      required
                    />
                  </div>
                  
                  <div className="mb25">
                    <label className="form-label fw500 dark-color">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={updateFormData}
                      className="form-control"
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <button
                      className="ud-btn btn-white"
                      type="button"
                      onClick={prevStep}
                    >
                      <i className="fal fa-arrow-left-long"></i> Back
                    </button>
                    <button
                      className="ud-btn btn-thm default-box-shadow2"
                      type="button"
                      onClick={nextStep}
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
                  
                  <div className="mb25">
                    <label className="form-label fw500 dark-color">Phone Number</label>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={updateFormData}
                      className="form-control"
                      placeholder="123-456-7890"
                      pattern="[0-9]{3}[0-9]{3}[0-9]{4}"
                      required
                    />
                  </div>
                  
                  {/* Add address fields if needed */}
                  
                  <div className="d-flex justify-content-between">
                    <button
                      className="ud-btn btn-white"
                      type="button"
                      onClick={prevStep}
                    >
                      <i className="fal fa-arrow-left-long"></i> Back
                    </button>
                    <button
                      className="ud-btn btn-thm default-box-shadow2"
                      type="submit"
                    >
                      Create Account <i className="fal fa-arrow-right-long" />
                    </button>
                  </div>
                </>
              )}
              
              {errorMessage && (
                <p style={{ color: 'red', marginTop: '10px' }}>
                  {errorMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
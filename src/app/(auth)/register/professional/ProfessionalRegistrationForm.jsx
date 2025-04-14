// app/(auth)/register/professional/ProfessionalRegistrationForm.jsx
'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { signupProfessional } from './actions'
import { createClient } from '../../../../../utils/supabase/client'
import styles from './ProfessionalForm.module.css';

export default function ProfessionalRegistrationForm({ errorMessage }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    experience: '',
    hourlyRate: '',
    dailyRate: '',
    serviceRadius: '',
    websiteUrl: '',
    portfolioUrl: '',
    password: '',
    confirmPassword: '',
    services: [],
    specializations: [],
    streetAddress: '',
    city: '',
    parish: '',
    community: '',
    landmark: '',
    isRural: false
  })
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // For services and categories data
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filteredServices, setFilteredServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategoryExpansion = (categoryId) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  // Fetch categories and services
  useEffect(() => {
    const fetchCategoriesAndServices = async () => {
      setLoading(true)
      const supabase = createClient()
      
      // Fetch categories
      const { data: categoryData } = await supabase
        .from('service_category')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
      
      // Fetch services
      const { data: serviceData } = await supabase
        .from('service')
        .select(`
          service_id, 
          name, 
          description, 
          base_price, 
          service_subcategory(
            subcategory_id, 
            name, 
            category_id
          )
        `)
        .eq('is_active', true)
      
      setCategories(categoryData || [])
      setServices(serviceData || [])
      setLoading(false)
    }
    
    fetchCategoriesAndServices()
  }, [])

  // Filter services when category changes
  useEffect(() => {
    if (selectedCategory) {
      const filtered = services.filter(service => 
        service.service_subcategory?.category_id === selectedCategory
      )
      setFilteredServices(filtered)
    } else {
      setFilteredServices([])
    }
  }, [selectedCategory, services])

  const updateFormData = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Add validation logic
  if (name === 'email') {
    setErrors(prev => ({ ...prev, email: validateEmail(value) }));
  } 
  else if (name === 'password') {
    setErrors(prev => ({ 
      ...prev, 
      password: validatePassword(value),
      ...(formData.confirmPassword && {
        confirmPassword: validateConfirmPassword(value, formData.confirmPassword)
      })
    }));
  }
  else if (name === 'confirmPassword') {
    setErrors(prev => ({ 
      ...prev, 
      confirmPassword: validateConfirmPassword(formData.password, value) 
    }));
  }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    } 
    else if (name === 'password') {
      setErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }
    else if (name === 'confirmPassword') {
      setErrors(prev => ({ 
        ...prev, 
        confirmPassword: validateConfirmPassword(formData.password, value) 
      }));
    }
  };

  // Handle service selection
  const toggleService = (serviceId) => {
    setFormData(prev => {
      const services = [...prev.services]
      const index = services.indexOf(serviceId)
      if (index > -1) {
        services.splice(index, 1)
      } else {
        services.push(serviceId)
      }
      return { ...prev, services }
    })
  }

  // Handle specialization selection
  const toggleSpecialization = (categoryId) => {
    setFormData(prev => {
      const specializations = [...prev.specializations]
      const index = specializations.indexOf(categoryId)
      if (index > -1) {
        specializations.splice(index, 1)
      } else {
        specializations.push(categoryId)
      }
      return { ...prev, specializations }
    })
  }

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Please enter an email';
    if (!regex.test(email)) return 'Please enter a valid email address';
    return '';
  };
  
  // const validatePassword = (password) => {
  //   if (!password) return 'Password is required';
  //   if (password.length < 8) return 'Password must be at least 8 characters long';
  //   return '';
  // };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    
    const errors = [];
    
    // Check length
    if (password.length < 8) {
      errors.push('Be at least 8 characters long');
    }
    
    // Check for uppercase
    if (!/[A-Z]/.test(password)) {
      errors.push('Include at least one uppercase letter');
    }
    
    // Check for lowercase
    if (!/[a-z]/.test(password)) {
      errors.push('Include at least one lowercase letter');
    }
    
    // Check for numbers
    if (!/[0-9]/.test(password)) {
      errors.push('Include at least one number');
    }
    
    // Check for special characters
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Include at least one special character');
    }
    
    // Check for common patterns
    if (/^(?:abc|123|qwerty|password|admin|welcome|letmein)/i.test(password)) {
      errors.push('Avoid commonly used password patterns');
    }
    
    return errors.length > 0 
      ? `Your password must: ${errors.join(', ')}`
      : '';
  };
  
  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const nextStep = () => {

    if(currentStep === 1) {
       // Validate all step 1 fields
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.password, 
      formData.confirmPassword
    );
    
    // Update all errors
    setErrors({
      ...errors,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError
    });
    
    // Only proceed if there are no errors
    if (!emailError && !passwordError && !confirmPasswordError) {
      setCurrentStep(prev => prev + 1);
    }
  } else {
    // For other steps
    setCurrentStep(prev => prev + 1);
  }
    
  }
  const prevStep = () => setCurrentStep(prev => prev - 1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
  
    try {
      const submitData = new FormData()
      
      // Add basic form fields
      Object.entries(formData).forEach(([key, value]) => {
        const excludedFields = ['services', 'specializations', 'isRural'];
        
        if (!excludedFields.includes(key)) {
          submitData.append(key, value);
        }
      })
  
      // Append additional fields
      submitData.append('isRural', formData.isRural.toString())
      submitData.append('services', JSON.stringify(formData.services))
      submitData.append('specializations', JSON.stringify(formData.specializations))
      
      // Debug: Log all form data
      for (let [key, value] of submitData.entries()) {
        console.log(`${key}: ${value}`);
      }
  
      // Call signup action
      await signupProfessional(submitData)
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup');
    }
  }
  
  return (
    <form onSubmit={currentStep === 6 ? handleSubmit : e => e.preventDefault()}>
      <div className="container-fluid px-4">
        {/* <div className="row">
          <div className="col-lg-8 m-auto wow fadeInUp" data-wow-delay="300ms">
            <div className="main-title text-center mb-4">
              <h2 className="title">Create a Professional Account</h2>
              <p className="subtitle mt-2">Join our platform and start offering your services</p>
            </div>
          </div>
        </div> */}
        
        {/* Progress indicator */}
        {/* <div className="row mb-4">
          <div className="col-lg-8 mx-auto">
            <div className="d-flex justify-content-between">
              {['Account', 'Identity', 'Address', 'Services', 'Pricing', 'Contact'].map((step, index) => (
                <div 
                  key={index}
                  className={`${styles.stepIndicator} ${currentStep >= index + 1 ? styles.active : ''}`}
                  style={{cursor: 'pointer'}}
                  onClick={() => currentStep > index + 1 && setCurrentStep(index + 1)}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div> */}
        
        <div className="row">
          <div className="col-12">
            <div className="log-reg-form search-modal form-style1 bgc-white p-4 p-md-5 border-radius-12 default-box-shadow1">
              {/* Step 1: Account */}
              
              {currentStep === 1 && (
                  <div className="row">
                    {/* Left column for text content */}
                    <div className="col-md-5">
                      <div className="pe-md-4">
                        <h4 className="mb-3">Create your professional account</h4>
                        <p className="text-muted mb-4">
                          Join our platform to connect with clients looking for your professional services. Setting up your account gives you a presence on our marketplace where customers can discover and hire you.
                        </p>
                        <p className="text-muted">
                          Already have an account?{" "}
                          <Link href="/login" className="text-primary fw-bold">
                            Log In!
                          </Link>
                        </p>
                      </div>
                    </div>
    
    {/* Right column for form elements */}
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
)}

{/* Example of Step 2 with two-column layout */}
{currentStep === 2 && (
  <div className="row">
    {/* Left column for text content */}
    <div className="col-md-5">
      <div className="pe-md-4">
        <h2 className="mb-3">Personal Information</h2>
        <p className="text-muted mb-3">
          Tell clients about yourself. 
          Your personal information helps establish your identity on the platform and builds trust with potential clients.
        </p>
        <p className="text-muted mb-3">
          Your experience level is important as 
          clients often look for professionals with 
          specific levels of expertise for their projects.
        </p>
      </div>
    </div>
    
    {/* Right column for form elements */}
    <div className="col-md-7">
      <div className="mb-4">
        <label className="form-label fw-semibold">First Name</label>
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
      
      <div className="mb-4">
        <label className="form-label fw-semibold">Last Name</label>
        <input
          name="lastName"
          type="text"
          value={formData.lastName}
          onChange={updateFormData}
          className="form-control"
          placeholder="Smith"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="form-label fw-semibold">Years of Experience</label>
        <select
          name="experience"
          value={formData.experience}
          onChange={updateFormData}
          className="form-select"
          required
        >
          <option value="">Select years of experience</option>
          <option value="0">Less than 1 year</option>
          {[...Array(15)].map((_, i) => (
            <option key={i+1} value={i+1}>{i+1} year{i !== 0 ? 's' : ''}</option>
          ))}
          <option value="15+">More than 15 years</option>
        </select>
      </div>
    </div>
  </div>
)}
              
              {/* Step 2: Profile */}
              {/* {currentStep === 2 && (
                <>
                  <div className="mb-4">
                    <h4 className="mb-3">Personal Information</h4>
                    <p className="text-muted">Tell us about yourself</p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold">First Name</label>
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
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Last Name</label>
                    <input
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={updateFormData}
                      className="form-control"
                      placeholder="Smith"
                      required
                    />
                  </div> */}
{/*                   
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Years of Experience</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={updateFormData}
                      className="form-select"
                      required
                    >
                      <option value="">Select years of experience</option>
                      <option value="0">Less than 1 year</option>
                      {[...Array(15)].map((_, i) => (
                        <option key={i+1} value={i+1}>{i+1} year{i !== 0 ? 's' : ''}</option>
                      ))}
                      <option value="15+">More than 15 years</option>
                    </select>
                  </div>
                   */}
                  {/* <div className="d-flex justify-content-between">
                    <button
                      className="ud-btn btn-white"
                      type="button"
                      onClick={prevStep}
                    >
                      <i className="fal fa-arrow-left-long me-2"></i> Back
                    </button>
                    <button
                      className="ud-btn btn-thm default-box-shadow2"
                      type="button"
                      onClick={nextStep}
                    >
                      Continue <i className="fal fa-arrow-right-long ms-2" />
                    </button>
                  </div> */}
                {/* </> */}
              {/* // )} */}
              
              {currentStep === 3 && (
                <>
            <div className="row">
                <div className="col-md-5">

                  <div className="mb-4">
                    <h4 className="mb-3">Address Information</h4>
                    <p className="text-muted">Provide your primary address details</p>
                  </div>
                </div>

                  <div className="col-md-7">

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Street Address</label>
                    <input
                      name="streetAddress"
                      type="text"
                      value={formData.streetAddress}
                      onChange={updateFormData}
                      className="form-control"
                      placeholder="123 Main Street"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Parish</label>
                    <select
                      name="parish"
                      value={formData.parish}
                      onChange={updateFormData}
                      className="form-select"
                      required
                    >
                      <option value="">Select Parish</option>
                      <option value="Kingston">Kingston</option>
                      <option value="St. Andrew">St. Andrew</option>
                      <option value="St. Catherine">St. Catherine</option>
                      <option value="Clarendon">Clarendon</option>
                      <option value="Manchester">Manchester</option>
                      <option value="St. Elizabeth">St. Elizabeth</option>
                      <option value="Westmoreland">Westmoreland</option>
                      <option value="Hanover">Hanover</option>
                      <option value="St. James">St. James</option>
                      <option value="Trelawny">Trelawny</option>
                      <option value="St. Ann">St. Ann</option>
                      <option value="St. Mary">St. Mary</option>
                      <option value="Portland">Portland</option>
                      <option value="St. Thomas">St. Thomas</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold">City/Town</label>
                    <input
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={updateFormData}
                      className="form-control"
                      placeholder="Enter city or town"
                      required
                    />
                  </div>
                  
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Community (Optional)</label>
                      <input
                        name="community"
                        type="text"
                        value={formData.community}
                        onChange={updateFormData}
                        className="form-control"
                        placeholder="Enter community name"
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Landmark (Optional)</label>
                      <input
                        name="landmark"
                        type="text"
                        value={formData.landmark}
                        onChange={updateFormData}
                        className="form-control"
                        placeholder="Nearby landmark"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isRural"
                        name="isRural"
                        checked={formData.isRural}
                        onChange={(e) => setFormData(prev => ({
                          ...prev, 
                          isRural: e.target.checked
                        }))}
                      />
                      <label className="form-check-label" htmlFor="isRural">
                        This is a rural address
                      </label>
                    </div>
                  </div>
                  </div>

                  </div>
                  
                  {/* <div className="d-flex justify-content-between">
                    <button
                      className="ud-btn btn-white"
                      type="button"
                      onClick={prevStep}
                    >
                      <i className="fal fa-arrow-left-long me-2"></i> Back
                    </button>
                    <button
                      className="ud-btn btn-thm default-box-shadow2"
                      type="button"
                      onClick={nextStep}
                    >
                      Continue <i className="fal fa-arrow-right-long ms-2" />
                    </button>
                  </div> */}
                </>
              )}

              {/* The services step */}
              {currentStep === 4 && (
                <>

                <div className='row'>

                  <div className='col-md-5'>

            
                  <div className="pe-mb-4">
                    <h2 className="mb-3">Select Your Services</h2>
                    <p className="text-muted mb-3">Choose the services you offer to customers</p>
                    <p className="text-muted mb-3">
          Your service selections will determine which job opportunities are shown to you and help clients find you when searching for specific services.
        </p>

                  </div>
                  
                  </div>
                  {/* Search box */}

                  <div className='col-md-7'>

                    
              
                  <div className="mb-4">
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-end-0">
                        <i className="fa fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search for services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                   {/* Selected services summary */}
                   {formData.services.length > 0 && (
                    <div className="mt-4 p-3 border rounded-3 bg-light mb-4">
                      <h5 className="mb-3">Selected Services ({formData.services.length})</h5>
                      <div className="row g-2">
                        {formData.services.map(serviceId => {
                          const service = services.find(s => s.service_id === serviceId);
                          if (!service) return null;
                          
                          return (
                            <div className="col-md-6 mb-2" key={serviceId}>
                              <div className="d-flex align-items-center p-2 border rounded bg-white">
                                <span className="badge bg-primary rounded-circle me-2">
                                  <i className="fas fa-check"></i>
                                </span>
                                <span className="text-truncate flex-grow-1">{service.name}</span>
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-link text-danger ms-auto p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleService(serviceId);
                                  }}
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="accordion mb-4" id="serviceAccordion">
                      {categories.map(category => {
                        // Get services for this category
                        const categoryServices = services.filter(
                          service => service.service_subcategory?.category_id === category.category_id
                        );
                        
                        // Filter by search term if any
                        const filteredCategoryServices = searchTerm
                          ? categoryServices.filter(service => 
                              service.name.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                          : categoryServices;
                        
                        // Skip if no matching services in this category and we have a search term
                        if (searchTerm && filteredCategoryServices.length === 0) return null;
                        
                        return (
                          <div className="accordion-item mb-3" key={category.category_id}>
                            <h2 className="accordion-header">
                              <button 
                                className={`accordion-button ${expandedCategories.includes(category.category_id) ? '' : 'collapsed'}`}
                                type="button"
                                onClick={() => toggleCategoryExpansion(category.category_id)}
                              >
                                <i className={category.icon}></i> 
                                <span className="ms-2">{category.name}</span>
                                <span className="badge bg-primary rounded-pill ms-auto">{filteredCategoryServices.length}</span>
                              </button>
                            </h2>
                            
                            <div className={`accordion-collapse collapse ${expandedCategories.includes(category.category_id) ? 'show' : ''}`}>
                              <div className="accordion-body">
                                <div className="row g-3">
                                  {filteredCategoryServices.map(service => (
                                    <div className="col-md-6" key={service.service_id}>
                                      <div 
                                        className={`form-check-card p-3 ${formData.services.includes(service.service_id) ? 'border-primary bg-light' : ''}`}
                                        onClick={() => toggleService(service.service_id)}
                                      >
                                        <div className="form-check">
                                          {/* <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`service-${service.service_id}`}
                                            checked={formData.services.includes(service.service_id)}
                                            onChange={() => {}} // Handled by card click
                                            onClick={(e) => e.stopPropagation()}
                                          /> */}
                                          <label className="form-check-label fw-bold" htmlFor={`service-${service.service_id}`}>
                                            {service.name}
                                          </label>
                                        </div>
                                        {service.description && (
                                          <p className="small text-muted mb-0 mt-1">{service.description}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
      
                        );
                        
                      })}
                      
                    </div>
                    
                  )}
                  
                 
                  
                  {/* <div className="d-flex justify-content-between">
                    <button
                      className="ud-btn btn-white"
                      type="button"
                      onClick={prevStep}
                    >
                      <i className="fal fa-arrow-left-long me-2"></i> Back
                    </button>
                    <button
                      className="ud-btn btn-thm default-box-shadow2"
                      type="button"
                      onClick={nextStep}
                    >
                      Continue <i className="fal fa-arrow-right-long ms-2" />
                    </button>
                  </div> */}
                                          </div>

                        </div>
                </>
                
              )}

              {/* Step 5: Price */}
              {currentStep === 5 && (
                <>
                <div className='row'>

                  <div className='col-md-5'>

                 
                  <div className="mb-4">
                    <h4 className="mb-3">How do you price your services?</h4>
                    <p className="text-muted">Set your preferred rates and service area</p>
                  </div>
                  </div>
                  


                  <div className='col-md-7'>





                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Price per hour ($J)</label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          name="hourlyRate"
                          type="number"
                          value={formData.hourlyRate}
                          onChange={updateFormData}
                          className="form-control"
                          placeholder="e.g., 5000"
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Price per day ($J)</label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          name="dailyRate"
                          type="number"
                          value={formData.dailyRate}
                          onChange={updateFormData}
                          className="form-control"
                          placeholder="e.g., 30000"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold">How far can you work from your primary location? (km)</label>
                    <div className="input-group">
                      <input
                        name="serviceRadius"
                        type="number"
                        value={formData.serviceRadius}
                        onChange={updateFormData}
                        className="form-control"
                        placeholder="e.g., 25"
                        min="0"
                      />
                      <span className="input-group-text">km</span>
                    </div>
                  </div>

                  </div>

                  
                  {/* <div className="mb-4">
                    <label className="form-label fw-semibold">Website URL (Optional)</label>
                    <input
                      name="websiteUrl"
                      type="url"
                      value={formData.websiteUrl}
                      onChange={updateFormData}
                      className="form-control"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Link to your Portfolio (Optional)</label>
                    <input
                      name="portfolioUrl"
                      type="url"
                      value={formData.portfolioUrl}
                      onChange={updateFormData}
                      className="form-control"
                      placeholder="https://portfolio.com"
                    />
                  </div> */}
                  
                  {/* <div className="d-flex justify-content-between">
                    <button
                      className="ud-btn btn-white"
                      type="button"
                      onClick={prevStep}
                    >
                      <i className="fal fa-arrow-left-long me-2"></i> Back
                    </button>
                    <button
                      className="ud-btn btn-thm default-box-shadow2"
                      type="button"
                      onClick={nextStep}
                    >
                      Continue <i className="fal fa-arrow-right-long ms-2" />
                    </button>
                  </div> */}

</div>
                </>
                
              )}

              {/* Step 6: Contact */}
              {currentStep === 6 && (

                <>
<div className='row'>
                <div className='col-md-5'>


             
                  <div className="mb-4">
                    <h4 className="mb-3">Contact Information</h4>
                    <p className="text-muted">How clients will reach you</p>
                  </div>

                  </div>

                  <div className='col-md-7'>


               
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Phone Number</label>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={updateFormData}
                      className="form-control"
                      placeholder="876-123-4567"
                      pattern="[0-9]{3}[0-9]{3}[0-9]{4}"
                      required
                    />
                    <small className="form-text text-muted">Enter a valid phone number (e.g., 8761234567)</small>
                  </div>

                  
                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="agreeTerms"
                        required
                      />
                      <label className="form-check-label" htmlFor="agreeTerms">
                        I agree to the <a href="/terms" className="text-primary">Terms of Service</a> and <a href="/privacy" className="text-primary">Privacy Policy</a>
                      </label>
                    </div>
                  </div>

                  </div>
                  
                  {/* <div className="d-flex justify-content-between">
                    <button
                      className="ud-btn btn-white"
                      type="button"
                      onClick={prevStep}
                    >
                      <i className="fal fa-arrow-left-long me-2"></i> Back
                    </button>
                    <button
                      className="ud-btn btn-thm default-box-shadow2"
                      type="submit"
                    >
                      Create Account <i className="fal fa-arrow-right-long ms-2" />
                    </button>
                  </div> */}
                  </div>
                </>
              )}
              
              {errorMessage && (
                <div className="alert alert-danger mt-4 rounded-3" role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

{/* Fixed Bottom Progress Bar with Navigation Buttons */}
<div className="position-fixed bottom-0 start-0 end-0 bg-white px-3 py-3 border-top zindex-sticky">
  <div className="container">
    <div className="row align-items-center">
      <div className="col-4 text-start">
        {currentStep > 1 && (
          <button
            className="ud-btn btn-white btn-sm"
            type="button"
            onClick={prevStep}
          >
            <i className="fal fa-arrow-left-long me-2"></i> Back
          </button>
        )}
      </div>
      
      <div className="col-4">
        <div className="progress rounded-pill" style={{ height: '4px', backgroundColor: '#e9ecef' }}>
          <div
            className="progress-bar rounded-pill"
            role="progressbar"
            style={{
              width: `${(currentStep / 6) * 100}%`,
              backgroundColor: '#0d6efd',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
        <div className="text-center mt-1">
          <small className="text-muted"> {currentStep} of 6</small>
        </div>
      </div>
      
      <div className="col-4 text-end">
        {currentStep < 6 ? (
          <button
            className="ud-btn btn-thm btn-sm"
            type="button"
            onClick={nextStep}
          >
            Continue <i className="fal fa-arrow-right-long ms-2"></i>
          </button>
        ) : (
          <button
            className="ud-btn btn-thm btn-sm"
            type="submit"
          >
            Create Account <i className="fal fa-arrow-right-long ms-2"></i>
          </button>
        )}
      </div>
    </div>
  </div>
</div>

    </form>
    
  )
}
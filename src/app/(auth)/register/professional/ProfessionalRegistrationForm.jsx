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
    specializations: []
  })

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
  }

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

  const nextStep = () => setCurrentStep(prev => prev + 1)
  const prevStep = () => setCurrentStep(prev => prev - 1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const submitData = new FormData()
    
    // Add basic form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'services' && key !== 'specializations') {
        submitData.append(key, value)
      }
    })
    
    // Add services and specializations as JSON strings
    submitData.append('services', JSON.stringify(formData.services))
    submitData.append('specializations', JSON.stringify(formData.specializations))
    
    await signupProfessional(submitData)
  }
  
  return (
    <form onSubmit={currentStep === 5 ? handleSubmit : e => e.preventDefault()}>
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
          <div className="col-lg-8 mx-auto">
            <div className="d-flex justify-content-between">
              <div className={`${styles.stepIndicator} ${currentStep >= 1 ? styles.active : ''}`}>Account</div>
              <div className={`${styles.stepIndicator} ${currentStep >= 2 ? styles.active : ''}`}>Identity</div>
              <div className={`${styles.stepIndicator} ${currentStep >= 3 ? styles.active : ''}`}>Services</div>
              <div className={`${styles.stepIndicator} ${currentStep >= 4 ? styles.active : ''}`}>Pricing</div>
              <div className={`${styles.stepIndicator} ${currentStep >= 5 ? styles.active : ''}`}>Contact</div>
            </div>
          </div>
        </div>
        
        <div className="row wow fadeInRight" data-wow-delay="300ms">
          <div className="col-xl-6 mx-auto">
            <div className="log-reg-form search-modal form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
              {/* Step 1: Account */}
              {currentStep === 1 && (
                <>
                  <div className="mb30">
                    <h4>Create your professional account</h4>
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
                      placeholder="professional@email.com"
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
                      placeholder="*******"
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
                      placeholder="*******"
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
              
              {/* Step 2: Profile */}
              {currentStep === 2 && (
                <>
                  <div className="mb30">
                    <h4>Personal Information</h4>
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
                      placeholder="Smith"
                      required
                    />
                  </div>
                  
                  <div className="mb25">
                    <label className="form-label fw500 dark-color">Years of Experience</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={updateFormData}
                      className="form-control"
                      required
                    >
                      <option value="">Select years of experience</option>
                      <option value="0">Less than 1 year</option>
                      <option value="1">1 year</option>
                      <option value="2">2 years</option>
                      <option value="3">3 years</option>
                      <option value="4">4 years</option>
                      <option value="5">5 years</option>
                      <option value="6">6 years</option>
                      <option value="7">7 years</option>
                      <option value="8">8 years</option>
                      <option value="9">9 years</option>
                      <option value="10">10 years</option>
                      <option value="11">11 years</option>
                      <option value="12">12 years</option>
                      <option value="13">13 years</option>
                      <option value="14">14 years</option>
                      <option value="15">15 years</option>
                      <option value="15+">More than 15 years</option>
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
              
             
              
              {/* // The services step */}
{currentStep === 3 && (
  <>
    <div className="mb30">
      <h4>Select Your Services</h4>
      <p className="text-muted">Choose the services you offer to customers</p>
    </div>
    
    {/* Search box */}
    <div className="mb25">
      <input
        type="text"
        className="form-control"
        placeholder="Search for services..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
    
    {loading ? (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    ) : (
      <div className="accordion" id="serviceAccordion">
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
                  <span className="badge bg-primary ms-auto">{filteredCategoryServices.length}</span>
                </button>
              </h2>
              
              <div className={`accordion-collapse collapse ${expandedCategories.includes(category.category_id) ? 'show' : ''}`}>
                <div className="accordion-body">
                  <div className="row">
                    {filteredCategoryServices.map(service => (
                      <div className="col-md-6 mb-2" key={service.service_id}>
                        <div 
                          className={`form-check-card p-3 rounded border ${formData.services.includes(service.service_id) ? 'border-primary bg-light' : ''}`}
                          onClick={() => toggleService(service.service_id)}
                        >
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`service-${service.service_id}`}
                              checked={formData.services.includes(service.service_id)}
                              onChange={() => {}} // Handled by card click
                              onClick={(e) => e.stopPropagation()}
                            />
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
    
    {/* Selected services summary */}
    {formData.services.length > 0 && (
      <div className="mt-4 p-3 border rounded bg-light">
        <h5>Selected Services ({formData.services.length})</h5>
        <div className="row">
          {formData.services.map(serviceId => {
            const service = services.find(s => s.service_id === serviceId);
            if (!service) return null;
            
            return (
              <div className="col-md-6 mb-2" key={serviceId}>
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary me-2">
                    <i className="fas fa-check"></i>
                  </span>
                  <span className="text-truncate">{service.name}</span>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-link text-danger ms-auto"
                    onClick={() => toggleService(serviceId)}
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
    
    <div className="d-flex justify-content-between mt-4">
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

 {/* Step 3: Price */}
 {currentStep === 4 && (
                <>
                  <div className="mb30">
                    <h4>How do you price your services?</h4>
                  </div>
                  
                  <div className="mb25">
                    <label className="form-label fw500 dark-color">Price per hour ($J)</label>
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
                  
                  <div className="mb25">
                    <label className="form-label fw500 dark-color">Price per day ($J)</label>
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
                  
                  <div className="mb25">
                    <label className="form-label fw500 dark-color">How far can you work from you primary location? (km)</label>
                    <input
                      name="serviceRadius"
                      type="number"
                      value={formData.serviceRadius}
                      onChange={updateFormData}
                      className="form-control"
                      placeholder="e.g., 25"
                      min="0"
                    />
                  </div>
                  
                  <div className="mb25">
                    <label className="form-label fw500 dark-color">Website URL (Optional)</label>
                    <input
                      name="websiteUrl"
                      type="url"
                      value={formData.websiteUrl}
                      onChange={updateFormData}
                      className="form-control"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  
                  <div className="mb25">
                    <label className="form-label fw500 dark-color"> Link to your Portfolio (Optional)</label>
                    <input
                      name="portfolioUrl"
                      type="url"
                      value={formData.portfolioUrl}
                      onChange={updateFormData}
                      className="form-control"
                      placeholder="https://portfolio.com"
                    />
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

              
              {/* Step 5: Contact */}
              {currentStep === 5 && (
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
                      placeholder="876-123-4567"
                      pattern="[0-9]{3}[0-9]{3}[0-9]{4}"
                      required
                    />
                    <small className="form-text text-muted">Enter a valid phone number (e.g., 8761234567)</small>
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
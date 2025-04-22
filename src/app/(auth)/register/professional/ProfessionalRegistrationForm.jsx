// app/(auth)/register/professional/ProfessionalRegistrationForm.jsx
'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { signupProfessional } from './actions'
import { createClient } from '../../../../../utils/supabase/client'
import styles from './ProfessionalForm.module.css';
import { useRouter } from 'next/navigation'
import Address from './Address'
import AddressMap from '@/components/Address/AddressMap'



export default function ProfessionalRegistrationForm({ errorMessage }) {

  const router = useRouter()

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
    latitude: '',
longitude: '',
formattedAddress: '',
placeId: '',
rawGoogleData: '',

    isRural: false
  })

  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
  lastName: '',
  experience: '',
  streetAddress: '',
  city: '',
  parish: '',
  // Optional fields don't need validation
  // community: '',
  // landmark: ''
  phone: '', // Add this line
  services: ''

  });

  // For services and categories data
  const [currentPage, setCurrentPage] = useState(1);
const [totalServices, setTotalServices] = useState(0);
const [itemsPerPage, setItemsPerPage] = useState(10);
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filteredServices, setFilteredServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false); 
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);


  const toggleCategoryExpansion = (categoryId) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  
  const fetchCategoriesAndServices = async () => {
    setLoading(true)
    const supabase = createClient()
    
    // Fetch categories
    const { data: categoryData } = await supabase
      .from('service_category')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

        // Fetch count first (for pagination)
        const { count } = await supabase
        .from('service')
        .select('*', { count: 'exact' })
        .eq('is_active', true);
            
        setTotalServices(count || 0);
        
      // Fetch paginated services
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
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
          
          setCategories(categoryData || [])
          setServices(serviceData || [])
          setLoading(false)
        };

  // Fetch categories and services
  useEffect(() => {
    
    fetchCategoriesAndServices()
  }, [])
  

  const handleAddressSelect = (place) => {
    const { formatted_address, geometry, place_id, address_components } = place
    const lat = geometry.location.lat()
    const lng = geometry.location.lng()
  
    const getComponent = (type) =>
      address_components.find(comp => comp.types.includes(type))?.long_name || ''
  
    const updatedFields = {
      streetAddress: getComponent('route') + ' ' + getComponent('street_number'),
      city: getComponent('locality') || getComponent('sublocality') || '',
      parish: getComponent('administrative_area_level_1') || '',
      formattedAddress: formatted_address,
      placeId: place_id,
      latitude: lat,
      longitude: lng,
      rawGoogleData: JSON.stringify(place)
    }
  
    setFormData(prev => ({ ...prev, ...updatedFields }))
  }

  

  const loadServicesForCategory = async (categoryId) => {
    setLoading(true);
    const supabase = createClient();
    
    if (categoryId) {
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
        .eq('service_subcategory.category_id', categoryId)
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .limit(0,15);
       
        
      setFilteredServices(serviceData || []);
    } else {
      fetchCategoriesAndServices();
    }
    setLoading(false);
  };

  
  
  
  // Update the effect that handles category changes
  useEffect(() => {
    if (selectedCategory) {
      loadServicesForCategory(selectedCategory);
    }
  }, [selectedCategory, currentPage]);

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

  
// Modified outside click handler
useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownOpen && !event.target.closest('.dropdown-search')) {
      // Only close if no services are selected
      if (formData.services.length > 0) {
        return;
      }
      setDropdownOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [dropdownOpen, formData.services]);
  

  const updateFormData = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Validate fields on change
  switch (name) {
    case 'email':
      setErrors(prev => ({ ...prev, email: validateEmail(value) }));
      break;
      case 'phone':
  setErrors(prev => ({ ...prev, phone: validatePhone(value) }));
  break;
    case 'password':
      setErrors(prev => ({ 
        ...prev, 
        password: validatePassword(value),
        ...(formData.confirmPassword && {
          confirmPassword: validateConfirmPassword(value, formData.confirmPassword)
        })
      }));
      break;
    case 'confirmPassword':
      setErrors(prev => ({ 
        ...prev, 
        confirmPassword: validateConfirmPassword(formData.password, value) 
      }));
      break;
    case 'firstName':
      setErrors(prev => ({ ...prev, firstName: validateFirstName(value) }));
      break;
    case 'lastName':
      setErrors(prev => ({ ...prev, lastName: validateLastName(value) }));
      break;
    case 'experience':
      setErrors(prev => ({ ...prev, experience: validateExperience(value) }));
      break;
    default:
      break;
  }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    switch (name) {
      case 'email':
        setErrors(prev => ({ ...prev, email: validateEmail(value) }));
         // If email is valid, check if it already exists
  if (!validateEmail(value)) {
    setIsCheckingEmail(true);
    checkEmailExists(value).then(exists => {
      if (exists) {
        setErrors(prev => ({ 
          ...prev, 
          email: 'This email is already registered. Please use a different email or login.' 
        }));
      }
      setIsCheckingEmail(false);
    });
  }
        break;
        case 'phone':
  setErrors(prev => ({ ...prev, phone: validatePhone(value) }));
  break;
      case 'password':
        setErrors(prev => ({ ...prev, password: validatePassword(value) }));
        break;
      case 'confirmPassword':
        setErrors(prev => ({ 
          ...prev, 
          confirmPassword: validateConfirmPassword(formData.password, value) 
        }));
        break;
      case 'firstName':
        setErrors(prev => ({ ...prev, firstName: validateFirstName(value) }));
        break;
      case 'lastName':
        setErrors(prev => ({ ...prev, lastName: validateLastName(value) }));
        break;
      case 'experience':
        setErrors(prev => ({ ...prev, experience: validateExperience(value) }));
        break;
        // Add these cases to your updateFormData switch statement
case 'streetAddress':
  setErrors(prev => ({ ...prev, streetAddress: validateStreetAddress(value) }));
  break;
case 'city':
  setErrors(prev => ({ ...prev, city: validateCity(value) }));
  break;
case 'parish':
  setErrors(prev => ({ ...prev, parish: validateParish(value) }));
  break;
      default:
        break;
    }
  };

  
  // Handle service selection
const toggleService = (serviceId) => {
  setFormData(prev => {
    const services = [...prev.services]
    const index = services.indexOf(serviceId)
    
    if (index > -1) {
      services.splice(index, 1)
      // If removing the last service, we don't need to clear the error
    } else {
      services.push(serviceId)
      // If adding a service, clear the services error
      setErrors(prev => ({ ...prev, services: '' }))
    }
    
    return { ...prev, services }
  })
}

  const checkEmailExists = async (email) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('account')
        .select('email')
        .eq('email', email)
        .single();
      
      if (data) {
        return true; // Email exists
      }
      return false; // Email doesn't exist
    } catch (error) {
      console.error('Error checking email:', error);
      return false; // Default to false on error
    }
  };

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

  // Add these validation functions
const validateFirstName = (firstName) => {
  if (!firstName) return 'First name is required';
  if (firstName.length < 2) return 'First name must be at least 2 characters';
  if (!/^[a-zA-Z\s-']+$/.test(firstName)) return 'First name can only contain letters, spaces, hyphens, and apostrophes';
  return '';
};

const validateLastName = (lastName) => {
  if (!lastName) return 'Last name is required';
  if (lastName.length < 2) return 'Last name must be at least 2 characters';
  if (!/^[a-zA-Z\s-']+$/.test(lastName)) return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
  return '';
};

const validateExperience = (experience) => {
  if (!experience) return 'Please select your years of experience';
  return '';
};

const validateStreetAddress = (streetAddress) => {
  if (!streetAddress) return 'Street address is required';
  if (streetAddress.length < 5) return 'Please enter a complete street address';
  return '';
};

const validateCity = (city) => {
  if (!city) return 'City/Town is required';
  if (city.length < 2) return 'Please enter a valid city or town name';
  return '';
};

const validateParish = (parish) => {
  if (!parish) return 'Please select a parish';
  return '';
};

const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  // This regex checks for a 10-digit number, optionally formatted with dashes or spaces
  const regex = /^(\d{10}|\d{3}[-\s]\d{3}[-\s]\d{4}|\d{3}[-\s]\d{7})$/;
  if (!regex.test(phone.replace(/[-()\s]/g, ''))) {
    return 'Please enter a valid 10-digit phone number';
  }
  return '';
};

  
  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const nextStep = async () => {
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
  
      // First check if there are any validation errors and stop if there are
      if (emailError || passwordError || confirmPasswordError) {
        return; // Don't proceed if there are validation errors
      }
  
      // Only check email existence if there are no validation errors
      if (isCheckingEmail) {
        return; // Don't proceed while checking email
      }
      
      // Check for duplicate email
      setIsCheckingEmail(true);
      try {
        const exists = await checkEmailExists(formData.email);
        if (exists) {
          setErrors(prev => ({
            ...prev,
            email: 'This email is already registered. Please use a different email or login.'
          }));
          setIsCheckingEmail(false);
          return; // Don't proceed if email exists
        }
        
        // Only proceed if all checks pass
        setIsCheckingEmail(false);
        setCurrentStep(prev => prev + 1);
      } catch (error) {
        console.error('Error checking email:', error);
        setIsCheckingEmail(false);
      }
    }
    else if (currentStep === 2) {
      // Validate step 2 fields
      const firstNameError = validateFirstName(formData.firstName);
      const lastNameError = validateLastName(formData.lastName);
      const experienceError = validateExperience(formData.experience);
      
      setErrors({
        ...errors,
        firstName: firstNameError,
        lastName: lastNameError,
        experience: experienceError
      });
      
      if (!firstNameError && !lastNameError && !experienceError) {
        setCurrentStep(prev => prev + 1);
      }
    }
    else if (currentStep === 3) {
      // Validate address fields
      const streetAddressError = validateStreetAddress(formData.streetAddress);
      const cityError = validateCity(formData.city);
      const parishError = validateParish(formData.parish);
      
      setErrors({
        ...errors,
        streetAddress: streetAddressError,
        city: cityError,
        parish: parishError
      });
      
      if (!streetAddressError && !cityError && !parishError) {
        setCurrentStep(prev => prev + 1);
      }
    }
    else if (currentStep === 4) {
      // Validate services selection
      if (formData.services.length === 0) {
        setErrors(prev => ({
          ...prev,
          services: 'Please select at least one service'
        }));
        return; // Stop progression
      }
      
      // Clear any previous services error
      setErrors(prev => ({
        ...prev,
        services: ''
      }));
      
      // If validation passes, move to next step
      setCurrentStep(prev => prev + 1);
    }
    else if (currentStep === 5) {
      // For pricing step - currently no validation required
      setCurrentStep(prev => prev + 1);
    }
    else {
      // Should never get here, but just in case
      setCurrentStep(prev => prev + 1);
    }
  }
  
  const prevStep = () => setCurrentStep(prev => prev - 1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const submitData = new FormData()
      
      // Explicitly add all fields, including confirmPassword
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'services' && key !== 'specializations') {
          submitData.append(key, value);
        }
      })

      // Validate phone number before submission
  const phoneError = validatePhone(formData.phone);
  if (phoneError) {
    setErrors(prev => ({ ...prev, phone: phoneError }));
    return; // Stop submission if phone is invalid
  }
  
      // Add these separately
      submitData.append('services', JSON.stringify(formData.services))
      submitData.append('specializations', JSON.stringify(formData.specializations))
      
      // Use try/catch instead of multiple redirects
      await signupProfessional(submitData)
    } catch (error) {
      console.error('Signup error:', error);
      // Handle error more gracefully
      router.push('/register/professional?error=' + encodeURIComponent(error.message))
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
    onBlur={handleBlur}
    className={`form-control ${errors.firstName ? 'is-invalid' : formData.firstName ? 'is-valid' : ''}`}
    placeholder="John"
    required
    aria-describedby="firstNameFeedback"
  />
  {errors.firstName && (
    <div id="firstNameFeedback" className="invalid-feedback">
      {errors.firstName}
    </div>
  )}
</div>

<div className="mb-4">
  <label className="form-label fw-semibold">Last Name</label>
  <input
    name="lastName"
    type="text"
    value={formData.lastName}
    onChange={updateFormData}
    onBlur={handleBlur}
    className={`form-control ${errors.lastName ? 'is-invalid' : formData.lastName ? 'is-valid' : ''}`}
    placeholder="Smith"
    required
    aria-describedby="lastNameFeedback"
  />
  {errors.lastName && (
    <div id="lastNameFeedback" className="invalid-feedback">
      {errors.lastName}
    </div>
  )}
</div>

<div className="mb-4">
  <label className="form-label fw-semibold">Years of Experience</label>
  <select
    name="experience"
    value={formData.experience}
    onChange={updateFormData}
    onBlur={handleBlur}
    className={`form-select ${errors.experience ? 'is-invalid' : formData.experience ? 'is-valid' : ''}`}
    required
    aria-describedby="experienceFeedback"
  >
    <option value="">Select years of experience</option>
    <option value="0">Less than 1 year</option>
    {[...Array(15)].map((_, i) => (
      <option key={i+1} value={i+1}>{i+1} year{i !== 0 ? 's' : ''}</option>
    ))}
    <option value="15+">More than 15 years</option>
  </select>
  {errors.experience && (
    <div id="experienceFeedback" className="invalid-feedback">
      {errors.experience}
    </div>
  )}
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

                {/* Street Address Field */}
{/* <div className="mb-4">
  <label className="form-label fw-semibold">Street Address</label>
  <input
    name="streetAddress"
    type="text"
    value={formData.streetAddress}
    onChange={updateFormData}
    onBlur={handleBlur}
    className={`form-control ${errors.streetAddress ? 'is-invalid' : formData.streetAddress ? 'is-valid' : ''}`}
    placeholder="123 Main Street"
    required
    aria-describedby="streetAddressFeedback"
  />
  {errors.streetAddress && (
    <div id="streetAddressFeedback" className="invalid-feedback">
      {errors.streetAddress}
    </div>
  )}
</div>

<div className="mb-4">
  <label className="form-label fw-semibold">Parish</label>
  <select
    name="parish"
    value={formData.parish}
    onChange={updateFormData}
    onBlur={handleBlur}
    className={`form-select ${errors.parish ? 'is-invalid' : formData.parish ? 'is-valid' : ''}`}
    required
    aria-describedby="parishFeedback"
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
  {errors.parish && (
    <div id="parishFeedback" className="invalid-feedback">
      {errors.parish}
    </div>
  )}
</div>

<div className="mb-4">
  <label className="form-label fw-semibold">City/Town</label>
  <input
    name="city"
    type="text"
    value={formData.city}
    onChange={updateFormData}
    onBlur={handleBlur}
    className={`form-control ${errors.city ? 'is-invalid' : formData.city ? 'is-valid' : ''}`}
    placeholder="Enter city or town"
    required
    aria-describedby="cityFeedback"
  />
  {errors.city && (
    <div id="cityFeedback" className="invalid-feedback">
      {errors.city}
    </div>
  )}
</div> */}

<Address onSelect={handleAddressSelect} />

                  
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

           {/* Step 4: Services - With Combined Search & Limited Services */}
           {currentStep === 4 && (
  <div className="row">
    <div className="col-md-5">
      <div className="mb-4">
        <h2 className="mb-2">Select Your Professional Services</h2>
        <p className="text-muted mb-1">Step 4 of 6</p>
        <div className="progress mb-3" style={{ height: '4px' }}>
          <div className="progress-bar" style={{ width: '66%' }}></div>
        </div>
      </div>

      {/* Multi-select Services Dropdown */}
      <div className="mb-4 position-relative dropdown-search">
        <div className="input-group">
          <span className="input-group-text bg-transparent border-end-0">
            <i className="fas fa-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0 border-end-0"
            placeholder="Search services..."
            value={searchTerm}
            onClick={() => setDropdownOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!dropdownOpen) setDropdownOpen(true);
            }}
          />
          {searchTerm ? (
            <button 
              className="btn btn-outline-secondary border-start-0 border-end-0" 
              type="button"
              onClick={() => {
                setSearchTerm('');
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          ) : null}

        </div>
        
        {/* Dropdown Panel */}
        {dropdownOpen && (
          <div 
            className="dropdown-menu shadow-sm w-100 show p-0"
            style={{ display: 'block', position: 'absolute', zIndex: 1000 }}
          >
            <div className="p-3 custom-scrollbar" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Results Count */}
                  {searchTerm && (
                    <div className="mb-3 small text-muted">
                      {services.filter(service => 
                        service.name.toLowerCase().includes(searchTerm.toLowerCase())
                      ).length} results for "{searchTerm}"
                    </div>
                  )}
                  
                  {/* Service Items */}
                  <div className="d-flex flex-wrap gap-2">
                    {services
                      .filter(service => 
                        searchTerm === '' || 
                        service.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(service => (
                        <div 
                          key={service.service_id}
                          onClick={() => {
                            toggleService(service.service_id);
                          }}
                          className={`badge rounded-pill py-2 px-3 service-item ${
                            formData.services.includes(service.service_id) 
                              ? 'bg-primary text-white' 
                              : 'bg-light text-dark border'
                          } d-flex align-items-center gap-2 cursor-pointer`}
                          style={{ 
                            fontSize: '0.9rem', 
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                        >
                          {service.name}
                        </div>
                      ))
                    }
                  </div>
                  
                  {/* Empty State */}
                  {services.filter(service => 
                    service.name.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 && (
                    <div className="text-center py-3">
                      <div className="mb-3">
                        <i className="far fa-search text-muted" style={{ fontSize: '36px' }}></i>
                      </div>
                      <h6>No services found</h6>
                      <p className="text-muted small">Try different keywords</p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Confirmation Button */}
            <div className="p-3 border-top d-flex justify-content-end">
              <button 
                className="btn btn-primary"
                onClick={() => setDropdownOpen(false)}
              >
                Confirm Services
              </button>
            </div>
          </div>
        )}
      </div>

{/* Note: The Popular Services card section should be completely removed */}
        
        {/* Empty State
        {(selectedCategory ? filteredServices : 
          searchTerm ? services.filter(service => 
            service.name.toLowerCase().includes(searchTerm.toLowerCase())
          ) : services).length === 0 && (
          <div className="text-center py-4">
            <div className="mb-3">
              <i className="far fa-search text-muted" style={{ fontSize: '48px' }}></i>
            </div>
            <h6>No services found</h6>
            <p className="text-muted small">Try different keywords or browse categories</p>
          </div>
        )}
      </div>
       */}
      {/* Information Panel */}
      <div className="card bg-light border-0 mb-4 p-4">
        <div className="d-flex align-items-center mb-3">
          <i className="fas fa-info-circle text-primary me-2"></i>
          <h5 className="mb-0">Why Service Selection Matters</h5>
        </div>
        <p className="mb-3">
          The services you select determine which opportunities are shown to you and how clients 
          find you when searching our platform.
        </p>
        <p className="mb-0">
          Choose services that match your expertise and qualifications. You can add or remove 
          services later from your professional dashboard.
        </p>
      </div>

    
    </div>
    
    {/* Right column - Selected Services */}
    <div className="col-md-7">
       {/* Selected Services Panel as Tags */}
       <div className="card border mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0">Your Selected Services</h5>
          <span className="badge bg-primary">{formData.services.length}</span>
        </div>
        {/* Add error message here */}
  {errors.services && (
    <div className="alert alert-danger m-3" role="alert">
      <i className="fas fa-exclamation-circle me-2"></i>
      {errors.services}
    </div>
  )}
  
        <div className="card-body">
          {formData.services.length > 0 ? (
            <>
              <p className="text-muted small mb-3">We recommend selecting 3-5 services that best represent your expertise.</p>
              <div className="d-flex flex-wrap gap-2">
                {formData.services.map(serviceId => {
                  const service = services.find(s => s.service_id === serviceId);
                  if (!service) return null;
                  
                  return (
                    <div key={serviceId} className="badge rounded-pill bg-primary-subtle text-primary py-2 px-3 d-flex align-items-center">
                      <span>{service.name}</span>
                      <button 
                        type="button" 
                        className="btn btn-sm text-primary ms-2 p-0 border-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleService(serviceId);
                        }}
                      >
                        <i className="fas fa-times-circle"></i>
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mb-3">
                <i className="far fa-tags text-muted" style={{ fontSize: '48px' }}></i>
              </div>
              <h6>You haven't selected any services yet</h6>
              <p className="text-muted small mb-0">Search and select services to add them here</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Additional information or guidance can go here */}
      <div className="card bg-light border-0 p-4">
        <div className="d-flex align-items-center mb-3">
          <i className="fas fa-lightbulb text-warning me-2"></i>
          <h5 className="mb-0">Tips for Service Selection</h5>
        </div>
        <ul className="mb-0 ps-3">
          <li className="mb-2">Choose services that match your actual skills and experience</li>
          <li className="mb-2">Be specific rather than overly general</li>
          <li className="mb-2">Select services you're ready to start providing immediately</li>
          <li>You can update your services anytime from your profile</li>
        </ul>
      </div>
    </div>
  </div>
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
  <label className="form-label fw-semibold">Service Radius: {formData.serviceRadius} km</label>
  <input
    type="range"
    name="serviceRadius"
    min="1"
    max="50"
    step="1"
    value={formData.serviceRadius}
    onChange={updateFormData}
    className="form-range"
  />
  <small className="text-muted">Use the slider to set how far you're willing to travel from your primary location.</small>
</div>


                  <div className="mb-4">
  <label className="form-label fw-semibold">Map of your service area</label>
  <AddressMap 
    lat={formData.latitude}
    lng={formData.longitude}
    radius={formData.serviceRadius || 0}
  />
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
    onBlur={handleBlur}
    className={`form-control ${errors.phone ? 'is-invalid' : formData.phone ? 'is-valid' : ''}`}
    placeholder="876-123-4567"
    required
    aria-describedby="phoneFeedback"
  />
  {errors.phone && (
    <div id="phoneFeedback" className="invalid-feedback">
      {errors.phone}
    </div>
  )}
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
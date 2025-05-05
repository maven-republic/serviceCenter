// src/app/(auth)/register/professional/ProfessionalRegistrationForm.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../../../utils/supabase/client'
import { signupProfessional } from './actions'

import ProgressionIndicator  from './ProgressionIndicator'
import NavigationSelectors  from './NavigationSelectors'

// step components now live in the "increment" subfolder
import Account          from './increment/Account'
import Personal         from './increment/Personal'
import GeneralAddress   from './increment/GeneralAddress'
import Services         from './increment/Services'
import Pricing          from './increment/Pricing'
import Contact          from './increment/Contact'
import Education        from './increment/Education'
import CertificationInterface from './increment/professional-certification/CertificationInterface'


import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateFirstName,
  validateLastName,
  validateExperience,
  validateStreetAddress,
  validateCity,
  validateParish,
  validatePhone,
  validateDegree,
  validateInstitutionId,
  validateFieldOfStudy,
  validateEndDate
} from '../../../../../utils/validation'

import designs from './ProfessionalForm.module.css'


export default function ProfessionalRegistrationForm({ errorMessage }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    experience: '',
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
    isRural: false,
    services: [],
    hourlyRate: '',
    dailyRate: '',
    serviceRadius: '',
    phone: '',
    education: [],
    certifications: []


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
    services: '',
    phone: ''
  })
  const [categories, setCategories] = useState([])
  const [servicesList, setServicesList] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const supabase = createClient()
      const { data: cats } = await supabase
        .from('service_category')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
      const { data: svcs } = await supabase
        .from('service')
        .select('service_id, name, service_subcategory(*)')
        .eq('is_active', true)
      setCategories(cats || [])
      setServicesList(svcs || [])
      setLoading(false)
    }
    loadData()
  }, [])

  const updateFormData = e => {
    const { name, value, type, checked } = e.target
    setFormData(fd => ({
      ...fd,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleBlur = e => {
    const { name, value } = e.target
    switch (name) {
      case 'email':
        setErrors(err => ({ ...err, email: validateEmail(value) }))
        break
      case 'password':
        setErrors(err => ({ ...err, password: validatePassword(value) }))
        break
      case 'confirmPassword':
        setErrors(err => ({
          ...err,
          confirmPassword: validateConfirmPassword(formData.password, value)
        }))
        break
      case 'firstName':
        setErrors(err => ({ ...err, firstName: validateFirstName(value) }))
        break
      case 'lastName':
        setErrors(err => ({ ...err, lastName: validateLastName(value) }))
        break
      case 'experience':
        setErrors(err => ({ ...err, experience: validateExperience(value) }))
        break
      case 'streetAddress':
        setErrors(err => ({ ...err, streetAddress: validateStreetAddress(value) }))
        break
      case 'city':
        setErrors(err => ({ ...err, city: validateCity(value) }))
        break
      case 'parish':
        setErrors(err => ({ ...err, parish: validateParish(value) }))
        break
      case 'phone':
        setErrors(err => ({ ...err, phone: validatePhone(value) }))
        break
      default:
        break
    }
  }

  const handleAddressSelect = place => {
    const { formatted_address, geometry, place_id, address_components } = place
    const lat = geometry.location.lat()
    const lng = geometry.location.lng()
    const getComp = t =>
      address_components.find(c => c.types.includes(t))?.long_name || ''
    setFormData(fd => ({
      ...fd,
      streetAddress: getComp('route') + ' ' + getComp('street_number'),
      city: getComp('locality') || getComp('sublocality') || '',
      parish: getComp('administrative_area_level_1') || '',
      formattedAddress: formatted_address,
      placeId: place_id,
      latitude: lat,
      longitude: lng,
      rawGoogleData: JSON.stringify({ formatted_address, place_id, geometry })
    }))
  }

  const toggleService = id => {
    setFormData(fd => {
      const list = fd.services.includes(id)
        ? fd.services.filter(x => x !== id)
        : [...fd.services, id]
      return { ...fd, services: list }
    })
    setErrors(err => ({ ...err, services: '' }))
  }

  const checkEmailExists = async email => {
    setIsCheckingEmail(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('account')
      .select('email')
      .eq('email', email)
      .single()
    setIsCheckingEmail(false)
    return !!data
  }

  const nextStep = async () => {
    if (currentStep === 1) {
      // Step 1: Account validation
      const eErr = validateEmail(formData.email)
      const pErr = validatePassword(formData.password)
      const cErr = validateConfirmPassword(formData.password, formData.confirmPassword)
  
      setErrors(err => ({ ...err, email: eErr, password: pErr, confirmPassword: cErr }))
      if (eErr || pErr || cErr) return
  
      if (await checkEmailExists(formData.email)) {
        setErrors(err => ({
          ...err,
          email: 'This email is already registered. Please login or use another.'
        }))
        return
      }
  
      setCurrentStep(2)
  
    } else if (currentStep === 2) {
      // Step 2: Personal validation
      const fnErr = validateFirstName(formData.firstName)
      const lnErr = validateLastName(formData.lastName)
      const exErr = validateExperience(formData.experience)
  
      setErrors(err => ({ ...err, firstName: fnErr, lastName: lnErr, experience: exErr }))
      if (fnErr || lnErr || exErr) return
  
      setCurrentStep(3)
  
    } else if (currentStep === 3) {
      // Step 3: Education validation
      console.log('📚 Step 3 - Education Validation')
      console.log('→ Raw education data:', formData.education)
  
      if (!formData.education || formData.education.length === 0) {
        console.log('❌ No education entries found')
        return
      }
  
      const entry = formData.education[0]
      console.log('→ First education entry:', entry)
  
      const instErr = validateInstitutionId(entry.institutionId)
      const newInstErr = entry.institutionId === '__new'
        ? validateInstitutionName(entry.institutionName)
        : ''
      const degErr   = validateDegree(entry.degreeId)
      const fieldErr = validateFieldOfStudy(entry.fieldOfStudyId)
      const dateErr  = validateEndDate(entry.startDate, entry.endDate)
  
      console.log('Validation Results:')
      console.log('  Institution ID Error:', instErr)
      console.log('  Institution Name Error:', newInstErr)
      console.log('  Degree ID Error:', degErr)
      console.log('  Field of Study Error:', fieldErr)
      console.log('  Date Range Error:', dateErr)
  
      setErrors(err => ({
        ...err,
        institutionId:   instErr,
        institutionName: newInstErr,
        degree:          degErr,
        fieldOfStudy:    fieldErr,
        endDate:         dateErr
      }))
  
      if (instErr || newInstErr || degErr || fieldErr || dateErr) {
        console.log('❌ Validation failed — stopping progression')
        return
      }
  
      console.log('✅ Step 3 passed — advancing to step 4')
      setCurrentStep(4)
  
    } else if (currentStep === 4) {
      // Step 4: Address validation
      const saErr = validateStreetAddress(formData.streetAddress)
      const ctErr = validateCity(formData.city)
      const paErr = validateParish(formData.parish)
  
      setErrors(err => ({ ...err, streetAddress: saErr, city: ctErr, parish: paErr }))
      if (saErr || ctErr || paErr) return
  
      setCurrentStep(5)
  
    } else if (currentStep === 5) {
      // Step 5: Services validation
      if (formData.services.length === 0) {
        setErrors(err => ({ ...err, services: 'Please select at least one service.' }))
        return
      }
  
      setCurrentStep(6)
  
    } else if (currentStep === 6) {
      // Step 6: Pricing — no required validation
      setCurrentStep(7)
  
    } else {
      // Step 7: Final step (Contact), or advance from final
      setCurrentStep(s => s + 1)
    }
  }
  
  
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1)
    }
  }
  

  const handleSubmit = async e => {
    e.preventDefault()
    const data = new FormData()
    Object.entries(formData).forEach(([k, v]) =>
      data.append(k, k === 'services' ? JSON.stringify(v) : v)
    )
    try {
      await signupProfessional(data)
    } catch (err) {
      router.push(`/register/professional?error=${encodeURIComponent(err.message)}`)
    }
  }

  return (
    <form 
    className={designs.outer}
    onSubmit={currentStep === 6 ? handleSubmit : e => e.preventDefault()}>
      {errorMessage && (
        <div className="alert alert-danger mb-4">{errorMessage}</div>
      )}

      {/* <ProgressionIndicator
        currentStep={currentStep}
        onStepClick={step => step < currentStep && setCurrentStep(step)}
      /> */}

      {currentStep === 1 && (
        <Account
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          handleBlur={handleBlur}
          isCheckingEmail={isCheckingEmail}
        />
      )}
      {currentStep === 2 && (
        <Personal
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          handleBlur={handleBlur}
        />
      )}
      {currentStep === 3 && (
        <Education
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          handleBlur={handleBlur}
          allServices={servicesList}
        />
      )}

{currentStep === 4 && (
  <CertificationInterface
    formData={formData}
    updateFormData={updateFormData}
  />
)}

      {currentStep === 5 && (
        <GeneralAddress
          formData={formData}
          errors={errors}
          handleAddressSelect={handleAddressSelect}
          updateFormData={updateFormData}
        />
      )}
      {currentStep === 6 && (
        <Services
          categories={categories}
          services={servicesList}
          loading={loading}
          dropdownOpen={dropdownOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setDropdownOpen={setDropdownOpen}
          toggleService={toggleService}
          selectedServices={formData.services}
          errors={errors.services}
        />
      )}
      {currentStep === 7 && (
        <Pricing
          formData={formData}
          updateFormData={updateFormData}
        />
      )}
      {currentStep === 8 && (
        <Contact
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          handleBlur={handleBlur}
        />
      )}
<div style={{ height: '80px' }} />
      <NavigationSelectors
        currentStep={currentStep}
        nextStep={nextStep}
        prevStep={prevStep}
        totalSteps={8}
      />
    </form>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { signupProfessional } from './actions'

import Account from './increment/Account'
import Personal from './increment/Personal'
import GeneralAddress from './increment/GeneralAddress'
import Services from './increment/Services'
import SelectedServices from './increment/SelectedServices'
import Education from './increment/Education'
import CertificationInterface from './increment/professional-certification/CertificationInterface'
import WorkExperienceInterface from './increment/professional-work-experience/WorkExperienceInterface'
import AvailabilityInterface from './increment/professional-availability/AvailabilityInterface'
import NavigationSelectors from './NavigationSelectors'

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
  validateEndDate,
  validateWorkExperienceEntry
} from '@/utils/validation'

import designs from './ProfessionalForm.module.css'
import { useState, useEffect } from 'react'

export default function ProfessionalAccountCreation({ errorMessage, currentStep, setCurrentStep, nextStep, prevStep }) {
  const router = useRouter()
  const supabase = useSupabaseClient()

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
    certifications: [],
    workExperience: [],
    availability: [],
    availabilityOverrides: [],
    availabilityProtocol: {
      default_event_duration: null,
      min_notice_hours: null,
      buffer_minutes: null,
      max_bookings_per_day: null
    },
    selectedServices: [],
    serviceStartDates: {},
  })

  const [errors, setErrors] = useState({})
  const [categories, setCategories] = useState([])
  const [servicesList, setServicesList] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)


  useEffect(() => {
    async function loadData() {
      setLoading(true)
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
  }, [supabase])

  const updateFormData = (e) => {
    const { name, value, type, checked } = e.target
    const resolvedValue = type === 'checkbox' ? checked : value
    setFormData(fd => ({ ...fd, [name]: resolvedValue }))
  }

  const handleBlur = e => {
    const { name, value } = e.target
    switch (name) {
      case 'email': setErrors(err => ({ ...err, email: validateEmail(value) })); break
      case 'password': setErrors(err => ({ ...err, password: validatePassword(value) })); break
      case 'confirmPassword':
        setErrors(err => ({ ...err, confirmPassword: validateConfirmPassword(formData.password, value) }))
        break
      case 'firstName': setErrors(err => ({ ...err, firstName: validateFirstName(value) })); break
      case 'lastName': setErrors(err => ({ ...err, lastName: validateLastName(value) })); break
      case 'experience': setErrors(err => ({ ...err, experience: validateExperience(value) })); break
      case 'streetAddress': setErrors(err => ({ ...err, streetAddress: validateStreetAddress(value) })); break
      case 'city': setErrors(err => ({ ...err, city: validateCity(value) })); break
      case 'parish': setErrors(err => ({ ...err, parish: validateParish(value) })); break
      case 'phone': setErrors(err => ({ ...err, phone: validatePhone(value) })); break
    }
  }

  const handleAddressSelect = place => {
    const { formatted_address, geometry, place_id, address_components } = place
    const lat = geometry.location.lat()
    const lng = geometry.location.lng()
    const getComp = t => address_components.find(c => c.types.includes(t))?.long_name || ''
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
    const { data } = await supabase
      .from('account')
      .select('email')
      .eq('email', email)
      .single()
    setIsCheckingEmail(false)
    return !!data
  }

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const pErr = validatePassword(formData.password)
      const cErr = validateConfirmPassword(formData.password, formData.confirmPassword)
      const phoneErr = validatePhone(formData.phone)
      setErrors(err => ({
        ...err,
        password: pErr,
        confirmPassword: cErr,
        phone: phoneErr
      }))
      if (pErr || cErr || phoneErr) return
      setCurrentStep(2)
    } else if (currentStep === 2) {
      const eErr = validateEmail(formData.email)
      const fErr = validateFirstName(formData.firstName)
      const lErr = validateLastName(formData.lastName)
      setErrors(err => ({ ...err, email: eErr, firstName: fErr, lastName: lErr }))
      if (eErr || fErr || lErr) return
      if (await checkEmailExists(formData.email)) {
        setErrors(err => ({ ...err, email: 'This email is already registered. Please login or use another.' }))
        return
      }
      setCurrentStep(3)
    } else {
      setCurrentStep(s => s + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1)
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  if (currentStep !== 8) return

  setLoading(true)

  try {
    const form = document.querySelector('form')
    if (!form) return
    const data = new FormData(form)

    Object.entries(formData).forEach(([k, v]) => {
      data.set(k, Array.isArray(v) || typeof v === 'object' ? JSON.stringify(v) : v)
    })

    const result = await signupProfessional(data)
    if (result?.success) {
      router.push('/register/professional/success')
    }
  } catch (error) {
    console.error('❌ signupProfessional failed:', error)
  } finally {
    setLoading(false)
  }
}


  return (
    <form className={designs.outer}>
      {errorMessage && <div className="alert alert-danger mb-4">{errorMessage}</div>}

      {currentStep === 1 && <Account formData={formData} errors={errors} updateFormData={updateFormData} handleBlur={handleBlur} isCheckingEmail={isCheckingEmail} />}
      {currentStep === 2 && <Personal formData={formData} errors={errors} updateFormData={updateFormData} handleBlur={handleBlur} />}
      {currentStep === 3 && <GeneralAddress formData={formData} errors={errors} handleAddressSelect={handleAddressSelect} updateFormData={updateFormData} />}
      {currentStep === 4 && (
        <div className="row">
          <div className="col-md-5">
            <Services categories={categories} services={servicesList} loading={loading} dropdownOpen={dropdownOpen} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setDropdownOpen={setDropdownOpen} toggleService={toggleService} selectedServices={formData.services} formData={formData} updateFormData={updateFormData} errors={errors.services} />
          </div>
          <div className="col-md-7">
            <SelectedServices selected={formData.services} toggleService={toggleService} services={servicesList} formData={formData} updateFormData={updateFormData} />
          </div>
        </div>
      )}

      {currentStep === 5 && <Education formData={formData} errors={errors} updateFormData={updateFormData} handleBlur={handleBlur} allServices={servicesList} />}
      {currentStep === 6 && <CertificationInterface formData={formData} updateFormData={updateFormData} />}
      {currentStep === 7 && <WorkExperienceInterface formData={formData} updateFormData={updateFormData} />}
      {currentStep === 8 && <AvailabilityInterface formData={formData} updateFormData={updateFormData} />}

      <div style={{ height: '80px' }} />

      <NavigationSelectors
        currentStep={currentStep}
        nextStep={handleNextStep}
        prevStep={handlePrevStep}
        onSubmit={handleSubmit}
        totalSteps={8}
          loading={loading}

      />
    </form>
  )
}


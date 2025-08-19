// ===== BEST PRACTICE CustomerAccountCreationForm.jsx =====
// Production-ready, accessible, mobile-first responsive design
'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, Check, Shield, CreditCard, Users, Star } from 'lucide-react'
import { signupCustomer, checkEmailExists } from './actions'
import Address from './Address'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Separate Features Component for better organization
function TrustFeatures() {
  const features = [
    {
      icon: Shield,
      title: 'Honest work',
      desc: 'Every professional is thoroughly vetted for quality and reliability.'
    },
    {
      icon: CreditCard,
      title: 'Safe payment',
      desc: 'Book services within minutes, not days.'
    },
    {
      icon: Check,
      title: 'Clarity',
      desc: 'No sudden fees - clear pricing.'
    },
    {
      icon: Star,
      title: 'Selection',
      desc: 'Select from the 1% of professionals.'
    }
  ]

  return (
    <section className="space-y-6 lg:space-y-8" aria-labelledby="trust-features-heading">
      <header>
        <h2 id="trust-features-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
          Workers you can trust
        </h2>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        {features.map((feature, index) => {
          const IconComponent = feature.icon
          return (
            <article key={index} className="space-y-3">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                <IconComponent className="w-6 h-6 lg:w-7 lg:h-7 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-base lg:text-lg text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm lg:text-base leading-relaxed">{feature.desc}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

// Progress Steps Component
function ProgressSteps({ currentStep, steps }) {
  return (
    <div className="space-y-4" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={4}>
      <Progress value={((currentStep - 1) / 3) * 100} className="h-2" aria-label={`Step ${currentStep} of 4`} />
      <nav aria-label="Registration steps">
        <ol className="flex justify-between">
          {steps.map((step) => (
            <li key={step.number} className="flex flex-col items-center space-y-2">
              <div 
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                  currentStep >= step.number 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
                aria-current={currentStep === step.number ? "step" : undefined}
              >
                {step.number}
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">{step.label}</span>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}

// Password Strength Indicator Component
function PasswordStrengthIndicator({ password, strength }) {
  const getPasswordStrengthInfo = () => {
    if (password.length === 0) return { color: 'bg-muted', text: '', width: 0 }
    
    switch (strength) {
      case 1: return { color: 'bg-red-500', text: 'Very Weak', width: 16 }
      case 2: return { color: 'bg-red-400', text: 'Weak', width: 33 }
      case 3: return { color: 'bg-yellow-500', text: 'Fair', width: 50 }
      case 4: return { color: 'bg-yellow-400', text: 'Good', width: 66 }
      case 5: return { color: 'bg-green-400', text: 'Strong', width: 83 }
      case 6: return { color: 'bg-green-500', text: 'Very Strong', width: 100 }
      default: return { color: 'bg-muted', text: '', width: 0 }
    }
  }
  
  const strengthInfo = getPasswordStrengthInfo()

  if (!password) return null

  return (
    <div className="space-y-2" role="meter" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={6}>
      <div className="flex items-center space-x-3">
        <div className="flex-1 bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.color}`}
            style={{ width: `${strengthInfo.width}%` }}
          />
        </div>
        {strengthInfo.text && (
          <Badge variant="outline" className="text-xs">
            {strengthInfo.text}
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Password must be at least 8 characters with uppercase, lowercase, number, and special character.
      </p>
    </div>
  )
}

// Form Field Component
function FormField({ label, error, touched, children, required = false, description }) {
  const hasError = error && touched
  
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
      </Label>
      {children}
      {hasError && (
        <p className="text-sm text-destructive" role="alert" aria-live="polite">
          {error}
        </p>
      )}
      {description && !hasError && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

export default function CustomerAccountCreationForm({ errorMessage }) {
  // State management
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
  
  const [errors, setErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [touchedFields, setTouchedFields] = useState({})
  const [isAnimating, setIsAnimating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const steps = [
    { number: 1, label: 'Account' },
    { number: 2, label: 'Identity' },
    { number: 3, label: 'Contact' },
    { number: 4, label: 'Address' }
  ]

  // Form utilities
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setTouchedFields(prev => ({ ...prev, [field]: true }))
    
    const error = validateField(field, value)
    if (!error) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleInputChange = (e) => {
    updateFormData(e.target.name, e.target.value)
  }

  // Validation logic
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

  // Password strength calculation
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
    
    if (formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: validateField('confirmPassword', formData.confirmPassword)
      }))
    }
  }, [formData.password, formData.confirmPassword])

  // Email checking
  const checkEmail = async (email) => {
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

  // Step validation
  const validateStep = async (step) => {
    let isValid = true
    let newErrors = { ...errors }
    
    if (step === 1) {
      let emailError = validateField('email', formData.email)
      const passwordError = validateField('password', formData.password)
      const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword)
      
      if (!emailError && formData.email) {
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
      const firstNameError = validateField('firstName', formData.firstName)
      const lastNameError = validateField('lastName', formData.lastName)
      const genderError = validateField('gender', formData.gender)
      
      newErrors.firstName = firstNameError
      newErrors.lastName = lastNameError
      newErrors.gender = genderError
      
      if (firstNameError || lastNameError || genderError) {
        isValid = false
      }
    } else if (step === 3) {
      const phoneError = validateField('phone', formData.phone)
      newErrors.phone = phoneError
      
      if (phoneError) {
        isValid = false
      }
    }
    
    setErrors(newErrors)
    return isValid
  }

  // Navigation
  const nextStep = async () => {
    setIsChecking(true)
    
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
      setTouchedFields(prev => ({
        ...prev,
        phone: true
      }))
    }
    
    const isValid = await validateStep(currentStep)
    setIsChecking(false)
    
    if (isValid) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(prev => prev + 1)
        setIsAnimating(false)
      }, 300)
    }
  }
  
  const prevStep = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentStep(prev => prev - 1)
      setIsAnimating(false)
    }, 300)
  }

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setTouchedFields(prev => ({
      ...prev,
      phone: true
    }))
    
    const phoneError = validateField('phone', formData.phone)
    setErrors(prev => ({ ...prev, phone: phoneError }))
    
    if (phoneError) {
      return
    }
    
    const submitData = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'rawGoogleData') {
        submitData.append(key, JSON.stringify(value || {}))
      } else {
        submitData.append(key, value)
      }
    })
    
    await signupCustomer(submitData)
  }

  return (
    <div className="bg-background">
      {/* Mobile-first responsive container */}
      <div className="min-h-screen px-4 py-6 sm:py-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          
          {/* Main content grid - mobile-first approach */}
          <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
            
            {/* Features section - hidden on mobile, shown on lg+ */}
            <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-8">
              <TrustFeatures />
            </div>
            
            {/* Form section - full width on mobile, constrained on desktop */}
            <div className="lg:col-span-7">
              <div className="mx-auto max-w-2xl">
                <Card className="shadow-lg border-0 sm:border sm:shadow-sm">
                  <CardHeader className="text-center space-y-2 p-6 sm:p-8">
                    <CardTitle className="text-2xl sm:text-3xl font-bold">Create an Account</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      Join our platform to find trusted professionals
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-6 sm:p-8 pt-0">
                    <div className="space-y-8">
                      
                      {/* Progress indicator */}
                      <ProgressSteps currentStep={currentStep} steps={steps} />

                      {/* Form content with smooth transitions */}
                      <form onSubmit={currentStep === 4 ? handleSubmit : e => e.preventDefault()}>
                        <div className={`space-y-6 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                          
                          {/* Step 1: Account Creation */}
                          {currentStep === 1 && (
                            <div className="space-y-6" role="tabpanel" aria-labelledby="step-1">
                              <header className="space-y-2 text-center">
                                <h3 id="step-1" className="text-xl font-semibold">Create your customer account</h3>
                                <p className="text-sm text-muted-foreground">
                                  Already have an account?{" "}
                                  <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                                    Log In!
                                  </Link>
                                </p>
                              </header>
                              
                              <FormField
                                label="Email"
                                error={errors.email}
                                touched={touchedFields.email}
                                required
                                description="We'll never share your email with anyone else."
                              >
                                <Input
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  className={`h-12 ${errors.email && touchedFields.email ? 'border-destructive focus:border-destructive' : ''}`}
                                  placeholder="your@email.com"
                                  autoComplete="email"
                                  aria-describedby="email-description"
                                />
                              </FormField>
                              
                              <FormField
                                label="Password"
                                error={errors.password}
                                touched={touchedFields.password}
                                required
                              >
                                <div className="space-y-3">
                                  <div className="relative">
                                    <Input
                                      id="password"
                                      name="password"
                                      type={showPassword ? "text" : "password"}
                                      value={formData.password}
                                      onChange={handleInputChange}
                                      className={`h-12 pr-12 ${errors.password && touchedFields.password ? 'border-destructive focus:border-destructive' : ''}`}
                                      placeholder="Enter your password"
                                      autoComplete="new-password"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                      onClick={() => setShowPassword(!showPassword)}
                                      aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                  <PasswordStrengthIndicator password={formData.password} strength={passwordStrength} />
                                </div>
                              </FormField>
                              
                              <FormField
                                label="Confirm Password"
                                error={errors.confirmPassword}
                                touched={touchedFields.confirmPassword}
                                required
                              >
                                <div className="relative">
                                  <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`h-12 pr-12 ${errors.confirmPassword && touchedFields.confirmPassword ? 'border-destructive focus:border-destructive' : ''}`}
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                                  >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </FormField>
                              
                              <Button
                                type="button"
                                onClick={nextStep}
                                disabled={isChecking || isAnimating}
                                className="w-full h-12 text-base"
                              >
                                {isChecking ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Checking...
                                  </>
                                ) : (
                                  <>
                                    Continue
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                          
                          {/* Step 2: Profile Information */}
                          {currentStep === 2 && (
                            <div className="space-y-6" role="tabpanel" aria-labelledby="step-2">
                              <header className="text-center">
                                <h3 id="step-2" className="text-xl font-semibold">Your Profile</h3>
                              </header>
                              
                              <FormField
                                label="First Name"
                                error={errors.firstName}
                                touched={touchedFields.firstName}
                                required
                              >
                                <Input
                                  id="firstName"
                                  name="firstName"
                                  value={formData.firstName}
                                  onChange={handleInputChange}
                                  className={`h-12 ${errors.firstName && touchedFields.firstName ? 'border-destructive focus:border-destructive' : ''}`}
                                  placeholder="Enter your first name"
                                  autoComplete="given-name"
                                />
                              </FormField>
                              
                              <FormField
                                label="Last Name"
                                error={errors.lastName}
                                touched={touchedFields.lastName}
                                required
                              >
                                <Input
                                  id="lastName"
                                  name="lastName"
                                  value={formData.lastName}
                                  onChange={handleInputChange}
                                  className={`h-12 ${errors.lastName && touchedFields.lastName ? 'border-destructive focus:border-destructive' : ''}`}
                                  placeholder="Enter your last name"
                                  autoComplete="family-name"
                                />
                              </FormField>
                              
                              <FormField
                                label="Gender"
                                error={errors.gender}
                                touched={touchedFields.gender}
                                required
                              >
                                <Select
                                  value={formData.gender}
                                  onValueChange={(value) => updateFormData('gender', value)}
                                >
                                  <SelectTrigger className={`h-12 ${errors.gender && touchedFields.gender ? 'border-destructive focus:border-destructive' : ''}`}>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormField>
                              
                              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={prevStep}
                                  disabled={isAnimating}
                                  className="h-12 text-base order-2 sm:order-1 sm:w-auto"
                                >
                                  <ArrowLeft className="mr-2 h-4 w-4" />
                                  Back
                                </Button>
                                <Button
                                  type="button"
                                  onClick={nextStep}
                                  disabled={isAnimating}
                                  className="h-12 text-base flex-1 order-1 sm:order-2"
                                >
                                  Continue
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {/* Step 3: Contact Information */}
                          {currentStep === 3 && (
                            <div className="space-y-6" role="tabpanel" aria-labelledby="step-3">
                              <header className="text-center">
                                <h3 id="step-3" className="text-xl font-semibold">Contact Information</h3>
                              </header>
                              
                              <FormField
                                label="Phone Number"
                                error={errors.phone}
                                touched={touchedFields.phone}
                                required
                                description="Format: 123-456-7890 or (123) 456-7890"
                              >
                                <Input
                                  id="phone"
                                  name="phone"
                                  type="tel"
                                  value={formData.phone}
                                  onChange={handleInputChange}
                                  className={`h-12 ${errors.phone && touchedFields.phone ? 'border-destructive focus:border-destructive' : ''}`}
                                  placeholder="123-456-7890"
                                  autoComplete="tel"
                                />
                              </FormField>
                              
                              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={prevStep}
                                  disabled={isAnimating}
                                  className="h-12 text-base order-2 sm:order-1 sm:w-auto"
                                >
                                  <ArrowLeft className="mr-2 h-4 w-4" />
                                  Back
                                </Button>
                                <Button
                                  type="button"
                                  onClick={nextStep}
                                  disabled={isAnimating}
                                  className="h-12 text-base flex-1 order-1 sm:order-2"
                                >
                                  Continue
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Step 4: Address Information */}
                          {currentStep === 4 && (
                            <div className="space-y-6" role="tabpanel" aria-labelledby="step-4">
                              <header className="text-center">
                                <h3 id="step-4" className="text-xl font-semibold">Address Information</h3>
                              </header>

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

                              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={prevStep}
                                  disabled={isAnimating}
                                  className="h-12 text-base order-2 sm:order-1 sm:w-auto"
                                >
                                  <ArrowLeft className="mr-2 h-4 w-4" />
                                  Back
                                </Button>
                                <Button
                                  type="submit"
                                  disabled={isAnimating}
                                  className="h-12 text-base flex-1 order-1 sm:order-2"
                                >
                                  Create Account
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </form>
                      
                      {/* Global error message */}
                      {errorMessage && (
                        <Alert variant="destructive" role="alert">
                          <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Mobile features section - shown at bottom on mobile */}
            <div className="lg:hidden">
              <TrustFeatures />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
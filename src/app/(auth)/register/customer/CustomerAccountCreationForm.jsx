// app/(auth)/register/customer/CustomerAccountCreationForm.jsx
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

export default function CustomerAccountCreationForm({ errorMessage }) {
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
  const [isAnimating, setIsAnimating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  // Update form data
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setTouchedFields(prev => ({ ...prev, [field]: true }))
    
    // Clear error when user is typing if the input now passes validation
    const error = validateField(field, value)
    if (!error) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Handle input change for text inputs
  const handleInputChange = (e) => {
    updateFormData(e.target.name, e.target.value)
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
  }, [formData.password, formData.confirmPassword])

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

  // Validate fields before moving to next step
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

  const nextStep = async () => {
    setIsChecking(true)
    
    // Mark fields as touched
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

  // Get strength color and text
  const getPasswordStrengthInfo = () => {
    if (formData.password.length === 0) return { color: 'bg-muted', text: '', width: 0 }
    
    switch (passwordStrength) {
      case 1:
        return { color: 'bg-red-500', text: 'Very Weak', width: 16 }
      case 2:
        return { color: 'bg-red-400', text: 'Weak', width: 33 }
      case 3:
        return { color: 'bg-yellow-500', text: 'Fair', width: 50 }
      case 4:
        return { color: 'bg-yellow-400', text: 'Good', width: 66 }
      case 5:
        return { color: 'bg-green-400', text: 'Strong', width: 83 }
      case 6:
        return { color: 'bg-green-500', text: 'Very Strong', width: 100 }
      default:
        return { color: 'bg-muted', text: '', width: 0 }
    }
  }
  
  const strengthInfo = getPasswordStrengthInfo()

  // Features data
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

  const steps = [
    { number: 1, label: 'Account' },
    { number: 2, label: 'Identity' },
    { number: 3, label: 'Contact' },
    { number: 4, label: 'Address' }
  ]

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Workers you can trust</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div key={index} className="space-y-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <h5 className="font-semibold">{feature.title}</h5>
                    <p className="text-muted-foreground text-sm">{feature.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column - Form */}
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create an Account</CardTitle>
              <CardDescription>Join our platform to find trusted professionals</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Progress indicator */}
              <div className="space-y-4">
                <Progress value={((currentStep - 1) / 3) * 100} className="h-2" />
                <div className="flex justify-between">
                  {steps.map((step) => (
                    <div key={step.number} className="flex flex-col items-center space-y-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= step.number 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {step.number}
                      </div>
                      <span className="text-xs text-muted-foreground">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={currentStep === 4 ? handleSubmit : e => e.preventDefault()}>
                <div className={`space-y-6 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                  
                  {currentStep === 1 && (
                    <>
                      <div className="space-y-2 text-center">
                        <h4 className="text-lg font-semibold">Create your customer account</h4>
                        <p className="text-sm text-muted-foreground">
                          Already have an account?{" "}
                          <Link href="/login" className="text-primary hover:underline">
                            Log In!
                          </Link>
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={errors.email && touchedFields.email ? 'border-destructive' : ''}
                          placeholder="your@email.com"
                        />
                        {errors.email && touchedFields.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                        <p className="text-xs text-muted-foreground">We'll never share your email with anyone else.</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleInputChange}
                            className={errors.password && touchedFields.password ? 'border-destructive pr-10' : 'pr-10'}
                            placeholder="Enter your password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {errors.password && touchedFields.password && (
                          <p className="text-sm text-destructive">{errors.password}</p>
                        )}
                        
                        {formData.password && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
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
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={errors.confirmPassword && touchedFields.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                            placeholder="Confirm your password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {errors.confirmPassword && touchedFields.confirmPassword && (
                          <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                        )}
                      </div>
                      
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={isChecking || isAnimating}
                        className="w-full"
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
                    </>
                  )}
                  
                  {currentStep === 2 && (
                    <>
                      <div className="text-center">
                        <h4 className="text-lg font-semibold">Your Profile</h4>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={errors.firstName && touchedFields.firstName ? 'border-destructive' : ''}
                          placeholder="Enter your first name"
                        />
                        {errors.firstName && touchedFields.firstName && (
                          <p className="text-sm text-destructive">{errors.firstName}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={errors.lastName && touchedFields.lastName ? 'border-destructive' : ''}
                          placeholder="Enter your last name"
                        />
                        {errors.lastName && touchedFields.lastName && (
                          <p className="text-sm text-destructive">{errors.lastName}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) => updateFormData('gender', value)}
                        >
                          <SelectTrigger className={errors.gender && touchedFields.gender ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.gender && touchedFields.gender && (
                          <p className="text-sm text-destructive">{errors.gender}</p>
                        )}
                      </div>
                      
                      <div className="flex justify-between gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          disabled={isAnimating}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={isAnimating}
                          className="flex-1"
                        >
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                  
                  {currentStep === 3 && (
                    <>
                      <div className="text-center">
                        <h4 className="text-lg font-semibold">Contact Information</h4>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={errors.phone && touchedFields.phone ? 'border-destructive' : ''}
                          placeholder="123-456-7890"
                        />
                        {errors.phone && touchedFields.phone && (
                          <p className="text-sm text-destructive">{errors.phone}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Format: 123-456-7890 or (123) 456-7890
                        </p>
                      </div>
                      
                      <div className="flex justify-between gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          disabled={isAnimating}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={isAnimating}
                          className="flex-1"
                        >
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}

                  {currentStep === 4 && (
                    <>
                      <div className="text-center">
                        <h4 className="text-lg font-semibold">Address Information</h4>
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

                      <div className="flex justify-between gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          disabled={isAnimating}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={isAnimating}
                          className="flex-1"
                        >
                          Create Account
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </form>
              
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
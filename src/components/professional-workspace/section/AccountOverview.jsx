// ===== MOBILE RESPONSIVE AccountOverview.jsx - BORDERLESS =====

'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useUserStore } from '@/store/userStore'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Save, 
  User, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Camera,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AccountOverview() {
  const { user, fetchUser } = useUserStore()
  const supabase = useSupabaseClient()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneLoading, setPhoneLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [initialValues, setInitialValues] = useState({})

  useEffect(() => {
    if (user?.account) {
      const values = {
        firstName: user.account.first_name || '',
        lastName: user.account.last_name || '',
        email: user.email || user.account.email || ''
      }
      
      setFirstName(values.firstName)
      setLastName(values.lastName)
      setEmail(values.email)
      setInitialValues(values)
    }
  }, [user])

  useEffect(() => {
    const currentValues = { firstName, lastName, email, phoneNumber }
    const changed = Object.keys(initialValues).some(key => 
      currentValues[key] !== initialValues[key]
    ) || phoneNumber !== (initialValues.phoneNumber || '')
    
    setHasChanges(changed)
  }, [firstName, lastName, email, phoneNumber, initialValues])

  useEffect(() => {
    const fetchPhone = async () => {
      if (!user?.account?.account_id) return setPhoneLoading(false)
      
      try {
        const { data } = await supabase
          .from('phone')
          .select('*')
          .eq('account_id', user.account.account_id)
          .order('is_primary', { ascending: false })
          .limit(1)

        if (data?.[0]?.phone_number) {
          setPhoneNumber(data[0].phone_number)
          setInitialValues(prev => ({ ...prev, phoneNumber: data[0].phone_number }))
        }
      } catch (error) {
        console.error('Error fetching phone:', error)
      } finally {
        setPhoneLoading(false)
      }
    }
    
    fetchPhone()
  }, [user?.account?.account_id, supabase])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus(null)
    
    try {
      const updates = {
        first_name: firstName,
        last_name: lastName,
        email: email,
      }

      const { error: accountError } = await supabase
        .from('account')
        .update(updates)
        .eq('account_id', user.account.account_id)

      if (accountError) throw accountError

      if (phoneNumber) {
        const { error: phoneError } = await supabase
          .from('phone')
          .update({ phone_number: phoneNumber })
          .eq('account_id', user.account.account_id)
          .eq('is_primary', true)

        if (phoneError) console.warn('Phone update error:', phoneError)
      }

      await fetchUser(user, supabase)
      setSaveStatus('success')
      setHasChanges(false)
      setInitialValues({ firstName, lastName, email, phoneNumber })
      
    } catch (error) {
      console.error('Save error:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && hasChanges) {
      e.preventDefault()
      await handleSave()
      e.target.blur()
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-8">
        <div className="text-center space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          <p className="text-sm sm:text-base text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Image Section - Mobile Responsive - REMOVED BORDER */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6 p-4 sm:p-6 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
        <div className="relative group flex-shrink-0">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
            <AvatarImage 
              src="/images/team/fl-1.png" 
              alt="Profile picture"
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary text-base sm:text-lg font-semibold">
              {firstName?.[0]}{lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
        </div>
        
        <div className="flex-1 space-y-2 sm:space-y-3 text-center sm:text-left">
          <h3 className="font-semibold text-foreground text-base sm:text-lg">Profile Picture</h3>
          <p className="text-sm text-muted-foreground">
            Upload a professional photo to build trust with clients
          </p>
          <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
            <Upload className="h-4 w-4" />
            Upload New Photo
          </Button>
        </div>
      </div>

      {/* Save Status Messages - Mobile Responsive - REMOVED BORDERS */}
      {saveStatus === 'success' && (
        <Alert className="bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Your account information has been updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert variant="destructive" className="border-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            There was an error updating your information. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Form Fields - Mobile Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">
            First Name *
          </Label>
          <div className="relative">
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onFocus={(e) => e.target.select()}
              onKeyDown={handleKeyDown}
              className={cn(
                "h-11 transition-all duration-200",
                firstName ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50" : ""
              )}
              placeholder="Enter your first name"
              required
            />
            {firstName && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last Name *
          </Label>
          <div className="relative">
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onFocus={(e) => e.target.select()}
              onKeyDown={handleKeyDown}
              className={cn(
                "h-11 transition-all duration-200",
                lastName ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50" : ""
              )}
              placeholder="Enter your last name"
              required
            />
            {lastName && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address *
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => e.target.select()}
              onKeyDown={handleKeyDown}
              className={cn(
                "h-11 transition-all duration-200",
                email ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50" : ""
              )}
              placeholder="Enter your email address"
              required
            />
            {email && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone Number
            <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>
          </Label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              value={phoneLoading ? '' : phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onFocus={(e) => e.target.select()}
              onKeyDown={handleKeyDown}
              disabled={phoneLoading}
              className={cn(
                "h-11 transition-all duration-200",
                phoneNumber ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50" : ""
              )}
              placeholder={phoneLoading ? "Loading..." : "Enter your phone number"}
            />
            {phoneLoading ? (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            ) : phoneNumber && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
            )}
          </div>
        </div>
      </div>

      {/* Save Button - Mobile Responsive - REMOVED BORDER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 sm:pt-6">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          {hasChanges ? (
            <span className="text-orange-600 dark:text-orange-400">You have unsaved changes</span>
          ) : (
            <span>All changes saved</span>
          )}
        </div>
        
        <Button 
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className={cn(
            "w-full sm:w-auto min-w-[140px] transition-all duration-200 h-11",
            hasChanges && "ring-2 ring-primary/20 ring-offset-2"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
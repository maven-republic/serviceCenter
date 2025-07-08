'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useUserStore } from '@/store/userStore'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Save, User } from 'lucide-react'

export default function AccountOverview() {
  const { user, fetchUser } = useUserStore()
  const supabase = useSupabaseClient()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneLoading, setPhoneLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user?.account) {
      setFirstName(user.account.first_name || '')
      setLastName(user.account.last_name || '')
      setEmail(user.email || user.account.email || '')
    }
  }, [user])

  useEffect(() => {
    const fetchPhone = async () => {
      if (!user?.account?.account_id) return setPhoneLoading(false)
      const { data } = await supabase
        .from('phone')
        .select('*')
        .eq('account_id', user.account.account_id)
        .order('is_primary', { ascending: false })
        .limit(1)

      if (data?.[0]?.phone_number) setPhoneNumber(data[0].phone_number)
      setPhoneLoading(false)
    }
    fetchPhone()
  }, [user?.account?.account_id, supabase])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updates = {
        first_name: firstName,
        last_name: lastName,
        email: email,
      }

      await supabase
        .from('account')
        .update(updates)
        .eq('account_id', user.account.account_id)

      await supabase
        .from('phone')
        .update({ phone_number: phoneNumber })
        .eq('account_id', user.account.account_id)
        .eq('is_primary', true)

      await fetchUser(user, supabase)
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      await handleSave()
      e.target.blur()
    }
  }

  if (!user) return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    </div>
  )

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Account Information</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Profile Image Section */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src="/images/team/fl-1.png" 
              alt="Profile picture"
            />
            <AvatarFallback className="bg-muted">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Profile Picture</p>
            <p className="text-xs text-muted-foreground">
              Click to upload a new image
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              First Name
            </Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onFocus={(e) => e.target.select()}
              onKeyDown={handleKeyDown}
              className="transition-colors focus:ring-2 focus:ring-primary/20"
              placeholder="Enter your first name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last Name
            </Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onFocus={(e) => e.target.select()}
              onKeyDown={handleKeyDown}
              className="transition-colors focus:ring-2 focus:ring-primary/20"
              placeholder="Enter your last name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => e.target.select()}
              onKeyDown={handleKeyDown}
              className="transition-colors focus:ring-2 focus:ring-primary/20"
              placeholder="Enter your email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phoneLoading ? 'Loading...' : phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onFocus={(e) => e.target.select()}
              onKeyDown={handleKeyDown}
              disabled={phoneLoading}
              className="transition-colors focus:ring-2 focus:ring-primary/20"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
      </CardContent>
    </Card>
  )
}
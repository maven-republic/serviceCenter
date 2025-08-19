// src/app/(professional-workspace)/professional/availability/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useUserStore } from '@/store/userStore'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, Clock, User } from 'lucide-react'
import AvailabilityManager from '@/components/professional-workspace/availability/AvailabilityManager'

export default function AvailabilityPage() {
  const { user, isLoading } = useUserStore()
  const supabase = useSupabaseClient()
  
  const [availabilityData, setAvailabilityData] = useState({
    availability: [],
    overrides: [],
    profileSettings: null,
    loading: true,
    error: null
  })

  // Get professional ID from user store
  const professionalId = user?.profile?.professional_id

  useEffect(() => {
    async function loadAvailabilityData() {
      if (!professionalId || !supabase) return

      try {
        setAvailabilityData(prev => ({ ...prev, loading: true, error: null }))

        // Load availability data
        const [availabilityResponse, overridesResponse] = await Promise.all([
          supabase
            .from('availability')
            .select('day_of_week, start_time, end_time')
            .eq('professional_id', professionalId)
            .order('day_of_week')
            .order('start_time'),
          
          supabase
            .from('availability_override')
            .select('override_date, start_time, end_time, is_available')
            .eq('professional_id', professionalId)
            .order('override_date')
        ])

        const { data: availability = [], error: availabilityError } = availabilityResponse
        const { data: overrides = [], error: overridesError } = overridesResponse

        if (availabilityError) throw availabilityError
        if (overridesError) throw overridesError

        // Get profile settings
        const profileSettings = {
          min_notice_hours: user.profile?.min_notice_hours,
          buffer_minutes: user.profile?.buffer_minutes,
          default_event_duration: user.profile?.default_event_duration,
          max_bookings_per_day: user.profile?.max_bookings_per_day
        }

        setAvailabilityData({
          availability,
          overrides,
          profileSettings,
          loading: false,
          error: null
        })

        console.log('🎯 Availability data loaded:', {
          availabilityCount: availability.length,
          overridesCount: overrides.length,
          professionalId,
          profileSettings
        })

      } catch (error) {
        console.error('❌ Error loading availability data:', error)
        setAvailabilityData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
      }
    }

    if (professionalId) {
      loadAvailabilityData()
    }
  }, [professionalId, supabase, user?.profile])

  // Mobile Loading State
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Loading Workspace</h2>
              <p className="text-sm text-muted-foreground">Setting up your availability management...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mobile Professional Profile Required State
  if (!professionalId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          {/* Mobile Header */}
          <div className="text-center py-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mx-auto mb-4">
              <User className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Professional Profile Required</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Complete your professional registration to manage your availability and start booking appointments.
            </p>
          </div>

          {/* Mobile Alert */}
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              No professional profile found. You need to complete your registration to access availability management.
            </AlertDescription>
          </Alert>

          {/* Mobile Action Button */}
          <Button 
            onClick={() => window.location.href = '/professional/account-information'}
            className="w-full h-12 text-base"
            size="lg"
          >
            Complete Profile Setup
          </Button>

          {/* Mobile Help Section */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Why do I need this?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Set your working hours and availability</li>
              <li>• Allow customers to book appointments</li>
              <li>• Manage your professional schedule</li>
              <li>• Control booking preferences and rules</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Mobile Data Loading State
  if (availabilityData.loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Loading Availability</h2>
              <p className="text-sm text-muted-foreground">Fetching your schedule settings...</p>
            </div>
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mobile Error State
  if (availabilityData.error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          {/* Mobile Error Header */}
          <div className="text-center py-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Error Loading Availability</h1>
            <p className="text-muted-foreground text-sm mb-6">
              We encountered an issue while loading your availability settings.
            </p>
          </div>

          {/* Mobile Error Alert */}
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {availabilityData.error}
            </AlertDescription>
          </Alert>

          {/* Mobile Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full h-12 text-base"
              size="lg"
            >
              <Loader2 className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/professional/workspace'}
              className="w-full h-12 text-base"
              size="lg"
            >
              Back to Workspace
            </Button>
          </div>

          {/* Mobile Troubleshooting */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Troubleshooting</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check your internet connection</li>
              <li>• Refresh the page</li>
              <li>• Try again in a few moments</li>
              <li>• Contact support if the issue persists</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Render the mobile-optimized availability manager
  return (
    <AvailabilityManager
      initialAvailability={availabilityData.availability}
      initialOverrides={availabilityData.overrides}
      professionalId={professionalId}
      profileSettings={availabilityData.profileSettings}
    />
  )
}
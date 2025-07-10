// src/app/(professional-workspace)/professional/availability/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useUserStore } from '@/store/userStore'
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

  // Show loading while user data is being fetched
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  // Check if user has professional profile
  if (!professionalId) {
    return (
      <div className="container py-8">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-foreground mb-4">Professional Profile Required</h2>
          <p className="text-muted-foreground mb-6">
            No professional profile found. Please complete your registration to manage availability.
          </p>
          <button 
            onClick={() => window.location.href = '/professional/account-information'}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Complete Profile
          </button>
        </div>
      </div>
    )
  }

  // Show loading while availability data loads
  if (availabilityData.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading availability settings...</p>
        </div>
      </div>
    )
  }

  // Show error if data loading failed
  if (availabilityData.error) {
    return (
      <div className="container py-8">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-foreground mb-4">Error Loading Availability</h2>
          <p className="text-muted-foreground mb-6">{availabilityData.error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Render the availability manager
  return (
    <AvailabilityManager
      initialAvailability={availabilityData.availability}
      initialOverrides={availabilityData.overrides}
      professionalId={professionalId}
      profileSettings={availabilityData.profileSettings}
    />
  )
}
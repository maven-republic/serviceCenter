'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import AvailabilityCalendar from './AvailabilityCalendar'

export default function AvailabilityViewer({ 
  availability: serverAvailability = [], 
  overrides: serverOverrides = [],
  availabilityJson,
  overridesJson 
}) {
  const supabase = createClientComponentClient()
  
  // Parse JSON props as fallback
  const fallbackAvailability = availabilityJson ? JSON.parse(availabilityJson) : []
  const fallbackOverrides = overridesJson ? JSON.parse(overridesJson) : []
  
  // Use server data or fallback
  const initialAvailability = serverAvailability?.length > 0 ? serverAvailability : fallbackAvailability
  const initialOverrides = serverOverrides?.length > 0 ? serverOverrides : fallbackOverrides
  
  const [availability, setAvailability] = useState(initialAvailability)
  const [overrides, setOverrides] = useState(initialOverrides)

  console.log('🎯 AvailabilityViewer initialized with:', {
    serverAvailability: serverAvailability?.length || 0,
    serverOverrides: serverOverrides?.length || 0,
    fallbackAvailability: fallbackAvailability?.length || 0,
    fallbackOverrides: fallbackOverrides?.length || 0,
    finalAvailability: availability?.length || 0,
    finalOverrides: overrides?.length || 0,
    hasAvailabilityJson: !!availabilityJson,
    hasOverridesJson: !!overridesJson
  })

  // Only try client-side fetch if we have no data at all
  useEffect(() => {
    // If we have any data from server, don't fetch client-side
    if (availability?.length > 0) {
      console.log('✅ Using server/fallback data, skipping client fetch')
      return
    }

    console.log('🔄 No server data, attempting client fetch...')
    
    const fetchAvailability = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session?.user) {
        console.warn('⏳ Waiting for session to rehydrate...')
        return
      }

      const userEmail = session.user.email
      console.log('🔍 Looking up availability for:', userEmail)

      try {
        // 1. Get account_id from email
        const { data: accountData, error: accountError } = await supabase
          .from('account')
          .select('account_id')
          .eq('email', userEmail)
          .single()

        if (accountError || !accountData) {
          console.error('❌ Failed to load account', accountError)
          return
        }

        console.log('✅ Account found:', accountData.account_id)

        // 2. Get professional_id from account_id
        const { data: profile, error: profileError } = await supabase
          .from('individual_professional')
          .select('professional_id')
          .eq('account_id', accountData.account_id)
          .single()

        if (profileError || !profile?.professional_id) {
          console.error('❌ Failed to load professional profile', profileError)
          return
        }

        const professionalId = profile.professional_id
        console.log('✅ Professional ID found:', professionalId)

        // 3. Fetch availability data
        const { data: baseAvailability, error: availabilityError } = await supabase
          .from('availability')
          .select('*')
          .eq('professional_id', professionalId)

        console.log('📊 Raw availability:', baseAvailability)

        // 4. Fetch override data
        const { data: overrideData, error: overrideError } = await supabase
          .from('availability_override')
          .select('*')
          .eq('professional_id', professionalId)

        if (availabilityError) console.error('❌ Error fetching availability:', availabilityError)
        if (overrideError) console.error('❌ Error fetching overrides:', overrideError)

        // 5. Format the data
        const formatted = (baseAvailability || []).map(entry => {
          console.log('🔍 Processing entry:', entry)
          return {
            ...entry,
            day_of_week: entry.day_of_week && typeof entry.day_of_week === 'string' 
              ? entry.day_of_week.toLowerCase() 
              : entry.day_of_week
          }
        })

        console.log('📆 Formatted availability:', formatted)
        console.log('📅 Override data:', overrideData)

        // 📊 Log time details for debugging
        formatted.forEach(entry => {
          console.log(`📅 ${entry.day_of_week}: ${entry.start_time} - ${entry.end_time}`)
        })

        setAvailability(formatted)
        setOverrides(overrideData || [])
      } catch (error) {
        console.error('❌ Error in client fetchAvailability:', error)
      }
    }

    fetchAvailability()
  }, [availability?.length, supabase])

  return (
    <AvailabilityCalendar
      availability={availability}
      overrides={overrides}
    />
  )
}
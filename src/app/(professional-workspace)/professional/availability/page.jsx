// /app/professional/availability/page.jsx
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import AvailabilityManager from '@/components/professional-workspace/availability/AvailabilityManager'

export default async function AvailabilityPage() {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('🔍 AvailabilityPage Debug:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    userEmail: session?.user?.email,
    userId: session?.user?.id
  })

  if (!session?.user) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h5>Access Required</h5>
          <p className="text-muted">Please log in to manage your availability.</p>
        </div>
      </div>
    )
  }

  // Get account by email
  const { data: accountData, error: accountError } = await supabase
    .from('account')
    .select('account_id')
    .eq('email', session.user.email)
    .single()

  console.log('🔍 Account lookup:', { accountData, accountError })

  if (accountError || !accountData) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h5>Account Not Found</h5>
          <p className="text-muted">Unable to find your account. Please contact support.</p>
        </div>
      </div>
    )
  }

  // Get professional profile
  const { data: userProfileData, error: profileError } = await supabase
    .from('individual_professional')
    .select('professional_id, min_notice_hours, buffer_minutes, default_event_duration, max_bookings_per_day')
    .eq('account_id', accountData.account_id)
    .single()

  console.log('🔍 Professional profile lookup:', { userProfileData, profileError })

  const professional_id = userProfileData?.professional_id

  if (!professional_id) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h5>Professional Profile Required</h5>
          <p className="text-muted">No professional profile found. Please complete your registration.</p>
        </div>
      </div>
    )
  }

  // Load availability data
  const { data: availability = [], error: availabilityError } = await supabase
    .from('availability')
    .select('day_of_week, start_time, end_time')
    .eq('professional_id', professional_id)
    .order('day_of_week')
    .order('start_time')

  const { data: overrides = [], error: overridesError } = await supabase
    .from('availability_override')
    .select('override_date, start_time, end_time, is_available')
    .eq('professional_id', professional_id)
    .order('override_date')

  console.log('🎯 Data loaded:', {
    availabilityCount: availability.length,
    overridesCount: overrides.length,
    sampleAvailability: availability[0],
    professional_id,
    profileSettings: {
      min_notice_hours: userProfileData.min_notice_hours,
      buffer_minutes: userProfileData.buffer_minutes,
      default_event_duration: userProfileData.default_event_duration,
      max_bookings_per_day: userProfileData.max_bookings_per_day
    }
  })

  if (availabilityError) {
    console.error('❌ Error loading availability:', availabilityError)
  }

  if (overridesError) {
    console.error('❌ Error loading overrides:', overridesError)
  }

  return (
    <AvailabilityManager
      initialAvailability={availability}
      initialOverrides={overrides}
      professionalId={professional_id}
      profileSettings={{
        min_notice_hours: userProfileData.min_notice_hours,
        buffer_minutes: userProfileData.buffer_minutes,
        default_event_duration: userProfileData.default_event_duration,
        max_bookings_per_day: userProfileData.max_bookings_per_day
      }}
    />
  )
}
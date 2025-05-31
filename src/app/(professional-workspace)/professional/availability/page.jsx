// /app/professional/availability/page.jsx
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import AvailabilityViewer from '@/components/professional-workspace/availability/AvailabilityViewer'

export default async function AvailabilityPage() {
  // 🔧 FIX: Await cookies() 
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
    return <p className="text-center py-5">Please log in to view availability.</p>
  }

  // 🔧 FIX: Query by email instead of session.user.id
  // The session.user.id might not match your account_id field
  const { data: accountData, error: accountError } = await supabase
    .from('account')
    .select('account_id')
    .eq('email', session.user.email)
    .single()

  console.log('🔍 Account lookup:', { accountData, accountError })

  if (accountError || !accountData) {
    return <p className="text-center py-5">Account not found. Please contact support.</p>
  }

  const { data: userProfileData, error: profileError } = await supabase
    .from('individual_professional')
    .select('professional_id')
    .eq('account_id', accountData.account_id)
    .single()

  console.log('🔍 Professional profile lookup:', { userProfileData, profileError })

  const professional_id = userProfileData?.professional_id

  if (!professional_id) {
    return <p className="text-center py-5">No professional profile found.</p>
  }

  const { data: availability = [] } = await supabase
    .from('availability')
    .select('day_of_week, start_time, end_time')
    .eq('professional_id', professional_id)

  const { data: overrides = [] } = await supabase
    .from('availability_override')
    .select('override_date, start_time, end_time, is_available')
    .eq('professional_id', professional_id)

  console.log('🎯 Data loaded:', {
    availabilityCount: availability.length,
    overridesCount: overrides.length,
    sampleAvailability: availability[0]
  })

  return (
    <AvailabilityViewer
      availability={availability}
      overrides={overrides}
      availabilityJson={JSON.stringify(availability)}
      overridesJson={JSON.stringify(overrides)}
    />
  )
}
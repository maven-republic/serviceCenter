export async function createProfessionalProfile(supabase, userId, data) {
  console.log('🏗️ Creating professional profile for:', userId)

  try {
    const { data: professionalData, error: profErr } = await supabase
      .from('individual_professional')
      .insert({
        account_id: userId,
        experience: data.experience || null,
        hourly_rate: data.hourlyRate || null,
        daily_rate: data.dailyRate || null,
        website_url: data.websiteUrl || null,
        portfolio_url: data.portfolioUrl || null,
        service_radius: data.serviceRadius || null,
        verification_status: 'pending',
        default_event_duration: data.availabilityProtocol?.default_event_duration || null,
        min_notice_hours: data.availabilityProtocol?.min_notice_hours || null,
        buffer_minutes: data.availabilityProtocol?.buffer_minutes || null,
        max_bookings_per_day: data.availabilityProtocol?.max_bookings_per_day || null
      })
      .select()
      .single()

    if (profErr || !professionalData) {
      console.error('❌ Professional insert error:', profErr)
      throw new Error('Failed to insert individual_professional: ' + (profErr?.message || 'No data returned'))
    }

    console.log('✅ Professional profile created:', professionalData.professional_id)
    return professionalData

  } catch (error) {
    console.error('❌ Professional profile creation failed:', error)
    throw error
  }
}
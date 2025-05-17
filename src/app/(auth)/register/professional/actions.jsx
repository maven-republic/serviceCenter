'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../../../../utils/supabase/server'

export async function signupProfessional(formData) {
  const supabase = await createClient()

  const firstName = formData.get('firstName')
  const lastName = formData.get('lastName')
  const userEmail = formData.get('email')
  const phoneNumber = formData.get('phone')
  const experience = formData.get('experience')
  const hourlyRate = formData.get('hourlyRate')
  const dailyRate = formData.get('dailyRate')
  const serviceRadius = formData.get('serviceRadius')
  const websiteUrl = formData.get('websiteUrl')
  const portfolioUrl = formData.get('portfolioUrl')
  const password = formData.get('password')

  const services = JSON.parse(formData.get('services') || '[]')
  const specializations = JSON.parse(formData.get('specializations') || '[]')
  const availability = JSON.parse(formData.get('availability') || '[]')
  const availabilityProtocol = JSON.parse(formData.get('availabilityProtocol') || '{}')

  const { data, error } = await supabase.auth.signUp({
    email: userEmail,
    password
  })

  if (error) {
    redirect('/register/professional?error=' + encodeURIComponent(error.message || 'Signup failed.'))
  }

  const userId = data?.user?.id

  const { error: accountError } = await supabase
    .from('account')
    .insert([{
      account_id: userId,
      email: userEmail,
      password_hash: 'MANAGED_BY_SUPABASE',
      first_name: firstName,
      last_name: lastName,
      account_status: 'pending',
      email_verified: false
    }])

  if (accountError) {
    redirect('/register/professional?error=' + encodeURIComponent('Failed to create account.'))
  }

  const { error: roleError } = await supabase
    .from('account_role')
    .insert([{
      account_id: userId,
      role_type: 'professional',
      role_status: 'pending',
      is_primary: true
    }])

  if (roleError) {
    redirect('/register/professional?error=' + encodeURIComponent('Failed to assign role.'))
  }

  const { error: phoneError } = await supabase
    .from('phone')
    .insert([{
      account_id: userId,
      phone_type: 'mobile',
      phone_number: phoneNumber,
      is_primary: true
    }])

  if (phoneError) {
    console.error('Failed to save phone number:', phoneError)
  }

  const { data: professionalData, error: professionalError } = await supabase
    .from('individual_professional')
    .insert([{
      account_id: userId,
      experience,
      hourly_rate: hourlyRate || null,
      daily_rate: dailyRate || null,
      website_url: websiteUrl || null,
      portfolio_url: portfolioUrl || null,
      service_radius: serviceRadius || null,
      verification_status: 'pending',
      default_event_duration: availabilityProtocol.default_event_duration || null,
      min_notice_hours: availabilityProtocol.min_notice_hours || null,
      buffer_minutes: availabilityProtocol.buffer_minutes || null,
      max_bookings_per_day: availabilityProtocol.max_bookings_per_day || null
    }])
    .select()

  if (professionalError) {
    redirect('/register/professional?error=' + encodeURIComponent('Failed to create professional profile.'))
  }

  const professionalId = professionalData[0].professional_id

  if (availability.length > 0) {
    const availabilityRecords = availability.map(slot => ({
      professional_id: professionalId,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time
    }))

    const { error: availabilityError } = await supabase
      .from('availability')
      .insert(availabilityRecords)

    if (availabilityError) {
      console.error('Error saving availability:', availabilityError)
    }
  }

  redirect('/login?message=' + encodeURIComponent('Registration successful! Please check your email to verify your account.'))
}

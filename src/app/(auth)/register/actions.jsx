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
  const confirmPassword = formData.get('confirmPassword')
  const calcomUsername = formData.get('calcomUsername') || null

  const services = JSON.parse(formData.get('services') || '[]')
  const specializations = JSON.parse(formData.get('specializations') || '[]')

  const { data, error } = await supabase.auth.signUp({
    email: userEmail,
    password: password
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
      experience: experience,
      hourly_rate: hourlyRate || null,
      daily_rate: dailyRate || null,
      website_url: websiteUrl || null,
      portfolio_url: portfolioUrl || null,
      service_radius: serviceRadius || null,
      verification_status: 'pending',
      calcom_username: calcomUsername
    }])
    .select()

  if (professionalError) {
    redirect('/register/professional?error=' + encodeURIComponent('Failed to create professional profile.'))
  }

  const professionalId = professionalData[0].professional_id

  const { error: addressError } = await supabase
    .from('address')
    .insert([{
      account_id: userId,
      address_type: 'home',
      street_address: formData.get('streetAddress'),
      city: formData.get('city'),
      parish: formData.get('parish'),
      community: formData.get('community') || null,
      landmark: formData.get('landmark') || null,
      formatted_address: formData.get('formattedAddress') || null,
      place_id: formData.get('placeId') || null,
      latitude: parseFloat(formData.get('latitude')),
      longitude: parseFloat(formData.get('longitude')),
      google_place_data: JSON.parse(formData.get('rawGoogleData') || '{}'),
      is_primary: true,
      is_rural: formData.get('isRural') === 'true',
      location: `SRID=4326;POINT(${formData.get('longitude')} ${formData.get('latitude')})`
    }])

  if (addressError) {
    console.error('Failed to save address:', addressError)
    redirect('/register/professional?error=' + encodeURIComponent('Failed to save address.'))
  }

  if (services.length > 0) {
    const serviceRecords = services.map(serviceId => ({
      professional_id: professionalId,
      service_id: serviceId,
      is_active: true
    }))

    const { error: servicesError } = await supabase
      .from('professional_service')
      .insert(serviceRecords)

    if (servicesError) {
      console.error('Error adding services:', servicesError)
    }
  }

  if (specializations.length > 0) {
    const specializationRecords = specializations.map(categoryId => ({
      professional_id: professionalId,
      category_id: categoryId,
      experience_years: experience || '1',
      is_primary: false
    }))

    if (specializationRecords.length > 0) {
      specializationRecords[0].is_primary = true
    }

    const { error: specializationsError } = await supabase
      .from('professional_specialization')
      .insert(specializationRecords)

    if (specializationsError) {
      console.error('Error adding specializations:', specializationsError)
    }
  }

  redirect('/login?message=' + encodeURIComponent('Registration successful! Please check your email to verify your account.'))
}

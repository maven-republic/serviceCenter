// app/(auth)/register/professional/actions.js
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
  
  // Parse services and specializations arrays
  const services = JSON.parse(formData.get('services') || '[]')
  const specializations = JSON.parse(formData.get('specializations') || '[]')
  
  // Validation
  // if (password !== confirmPassword) {
  //   redirect('/register/professional?error=' + encodeURIComponent('Passwords do not match.'))
  // }
  
  // Sign up the user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: userEmail,
    password: password
  })

  if (error) {
    redirect('/register/professional?error=' + encodeURIComponent(error.message || 'Signup failed.'))
  }

  const userId = data?.user?.id

  // Create account record
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

  // Create account role - automatically set as professional
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

  // Create phone record
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
    // Continue anyway as this isn't critical
  }

  // Create professional profile
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
      verification_status: 'pending'
    }])
    .select()
  
  if (professionalError) {
    redirect('/register/professional?error=' + encodeURIComponent('Failed to create professional profile.'))
  }

  // Get the professional ID for relationships
  const professionalId = professionalData[0].professional_id

  const { error: addressError } = await supabase
  .from('address')
  .insert([{
    account_id: userId,
    address_type: 'home', // Or choose appropriate type
    street_address: formData.get('streetAddress'),
    city: formData.get('city'),
    parish: formData.get('parish'),
    community: formData.get('community') || null,
    landmark: formData.get('landmark') || null,
    is_primary: true,
    is_rural: formData.get('isRural') === 'true'
  }])

if (addressError) {
  console.error('Failed to save address:', addressError)
  redirect('/register/professional?error=' + encodeURIComponent('Failed to save address.'))
}

  // Add professional services if any were selected
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
      // Continue anyway
    }
  }

  // Add professional specializations if any were selected
  if (specializations.length > 0) {
    const specializationRecords = specializations.map(categoryId => ({
      professional_id: professionalId,
      category_id: categoryId,
      experience_years: experience || '1',
      is_primary: false
    }))

    // Set the first specialization as primary
    if (specializationRecords.length > 0) {
      specializationRecords[0].is_primary = true
    }

    const { error: specializationsError } = await supabase
      .from('professional_specialization')
      .insert(specializationRecords)

    if (specializationsError) {
      console.error('Error adding specializations:', specializationsError)
      // Continue anyway
    }
  }

  redirect('/login?message=' + encodeURIComponent('Registration successful! Please check your email to verify your account.'))
}
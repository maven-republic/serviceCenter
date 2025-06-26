// app/(auth)/register/customer/actions.js
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// Check if email exists in DB
export async function checkEmailExists(input) {


  const supabase = await createClient()
  
  let email = input

  if (input instanceof FormData) {
    email = input.get('email')
  } else if (typeof input === 'object' && input !== null) {
    email = input.email
  }

  if (!email) {
    return { exists: false, error: 'No email provided' }
  }

  try {
    const { data, error } = await supabase
      .from('account')
      .select('email')
      .eq('email', email)
      .maybeSingle()

    if (error) {
      console.error('Supabase email check error:', error)
      return { exists: false, error: error.message }
    }

    return { exists: !!data, error: null }
  } catch (err) {
    console.error('checkEmailExists exception:', err)
    return { exists: false, error: 'Unexpected error checking email' }
  }
}

export async function signupCustomer(formData) {
  const supabase = await createClient()

  if (!supabase) {
    console.error('Supabase client failed to initialize')
    redirect('/register/customer?error=Server configuration error.')
  }

  const firstName = formData.get('firstName')
  const lastName = formData.get('lastName')
  const userEmail = formData.get('email')
  const phoneNumber = formData.get('phone')
  const gender = formData.get('gender')
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')

  if (password !== confirmPassword) {
    redirect('/register/customer?error=' + encodeURIComponent('Passwords do not match.'))
  }

  // Signup in Supabase Auth
const { data, error } = await supabase.auth.signUp({
  email: userEmail,
  password,
  options: {
    shouldPersistSession: true,
emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`

  }
})

  if (error || !data?.user) {
    redirect('/register/customer?error=' + encodeURIComponent(error?.message || 'Signup failed.'))
  }

  const userId = data.user.id

  // Insert into account
  const { error: accountError } = await supabase.from('account').insert([{
    account_id: userId,
    email: userEmail,
    password_hash: 'MANAGED_BY_SUPABASE',
    first_name: firstName,
    last_name: lastName,
    account_status: 'pending',
    email_verified: false
  }])
  if (accountError) {
    redirect('/register/customer?error=' + encodeURIComponent('Failed to create account.'))
  }

  // Assign role
  const { error: roleError } = await supabase.from('account_role').insert([{
    account_id: userId,
    role_type: 'customer',
    is_primary: true
  }])
  if (roleError) {
    redirect('/register/customer?error=' + encodeURIComponent('Failed to assign customer role.'))
  }

  // Phone
  const { error: phoneError } = await supabase.from('phone').insert([{
    account_id: userId,
    phone_type: 'mobile',
    phone_number: phoneNumber,
    is_primary: true
  }])
  if (phoneError) {
    redirect('/register/customer?error=' + encodeURIComponent('Failed to save phone number.'))
  }

  // Customer profile
  const { error: customerError } = await supabase.from('individual_customer').insert([{
    account_id: userId,
    gender
  }])
  if (customerError) {
    redirect('/register/customer?error=' + encodeURIComponent('Failed to create customer profile.'))
  }

  // Address
  const street = formData.get('street')
  const city = formData.get('city')
  const parish = formData.get('parish')
  const country = formData.get('country') || 'Jamaica'
  const formattedAddress = formData.get('formattedAddress')
  const placeId = formData.get('placeId')

  const latitudeRaw = formData.get('latitude')
  const longitudeRaw = formData.get('longitude')
  const latitude = latitudeRaw ? parseFloat(latitudeRaw) : null
  const longitude = longitudeRaw ? parseFloat(longitudeRaw) : null

  let googleData = null
  try {
    googleData = JSON.parse(formData.get('rawGoogleData') || '{}')
  } catch (err) {
    console.error('Failed to parse google_place_data:', err)
    googleData = {}
  }
  

  if (!isNaN(latitude) && !isNaN(longitude) && formattedAddress) {
    const { error: addressError } = await supabase.from('address').insert([{
      account_id: userId,
      is_primary: true,
      address_type: 'home',
      street_address: street,
      city,
      parish,
      country,
      formatted_address: formattedAddress,
      latitude,
      longitude,
      place_id: placeId,
      google_place_data: googleData,
      location: `SRID=4326;POINT(${longitude} ${latitude})`
    }])

    if (addressError) {
      console.error('Address insert error:', addressError)
      redirect('/register/customer?error=' + encodeURIComponent('Failed to save address.'))
    }
  }

  // Redirect to login
  redirect('/login')
}


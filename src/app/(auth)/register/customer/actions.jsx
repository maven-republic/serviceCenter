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
  console.log('🚀 Starting customer signup process...')
  
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

  console.log('📋 Registration data:', {
    firstName,
    lastName,
    userEmail,
    phoneNumber,
    gender,
    hasPassword: !!password,
    hasConfirmPassword: !!confirmPassword
  })

  if (password !== confirmPassword) {
    console.error('❌ Passwords do not match')
    redirect('/register/customer?error=' + encodeURIComponent('Passwords do not match.'))
  }

  try {
    // Step 1: Create Supabase Auth user
    console.log('🔐 Creating Supabase Auth user...')
    const { data, error } = await supabase.auth.signUp({
      email: userEmail,
      password,
      options: {
        shouldPersistSession: true,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`
      }
    })

    if (error || !data?.user) {
      console.error('❌ Supabase auth signup failed:', error)
      redirect('/register/customer?error=' + encodeURIComponent(error?.message || 'Signup failed.'))
    }

    const userId = data.user.id
    console.log('✅ Supabase Auth user created:', userId)

    // Step 2: Create account record
    console.log('📋 Creating account record...')
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
      console.error('❌ Account creation failed:', accountError)
      redirect('/register/customer?error=' + encodeURIComponent('Failed to create account.'))
    }
    console.log('✅ Account record created')

    // Step 3: Assign customer role
    console.log('👤 Assigning customer role...')
    const { error: roleError } = await supabase.from('account_role').insert([{
      account_id: userId,
      role_type: 'customer',
      is_primary: true
    }])
    
    if (roleError) {
      console.error('❌ Role assignment failed:', roleError)
      redirect('/register/customer?error=' + encodeURIComponent('Failed to assign customer role.'))
    }
    console.log('✅ Customer role assigned')

    // Step 4: Create phone record
    console.log('📞 Creating phone record...')
    const { error: phoneError } = await supabase.from('phone').insert([{
      account_id: userId,
      phone_type: 'mobile',
      phone_number: phoneNumber,
      is_primary: true
    }])
    
    if (phoneError) {
      console.error('❌ Phone record creation failed:', phoneError)
      redirect('/register/customer?error=' + encodeURIComponent('Failed to save phone number.'))
    }
    console.log('✅ Phone record created')

    // Step 5: Create CUSTOMER profile (FIXED TABLE NAME)
    console.log('🏠 Creating customer profile...')
    const { data: customerProfile, error: customerError } = await supabase
      .from('customer') // FIXED: Changed from 'individual_customer' to 'customer'
      .insert([{
        account_id: userId,
        gender,
        customer_type: 'individual', // Add this if your schema requires it
        status: 'active', // Add this if your schema requires it
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (customerError) {
      console.error('❌ Customer profile creation failed:', customerError)
      console.error('Error details:', {
        message: customerError.message,
        details: customerError.details,
        hint: customerError.hint,
        code: customerError.code
      })
      redirect('/register/customer?error=' + encodeURIComponent('Failed to create customer profile.'))
    }
    
    console.log('✅ Customer profile created:', customerProfile?.customer_id)

    // Step 6: Create address record
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
      console.log('📍 Creating address record...')
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
        console.error('❌ Address creation failed:', addressError)
        redirect('/register/customer?error=' + encodeURIComponent('Failed to save address.'))
      }
      console.log('✅ Address record created')
    }

    // Step 7: Verify the complete registration
    console.log('🔍 Verifying complete registration...')
    const { data: verificationData, error: verificationError } = await supabase
      .from('customer')
      .select(`
        customer_id,
        account_id,
        gender,
        customer_type,
        status,
        account:account_id (
          account_id,
          email,
          first_name,
          last_name,
          account_status
        )
      `)
      .eq('account_id', userId)
      .single()

    if (verificationError || !verificationData) {
      console.error('❌ Registration verification failed:', verificationError)
      redirect('/register/customer?error=' + encodeURIComponent('Registration incomplete - please contact support.'))
    }

    console.log('✅ Registration verification successful:', {
      customer_id: verificationData.customer_id,
      account_id: verificationData.account_id,
      email: verificationData.account?.email,
      status: verificationData.status
    })

    console.log('🎉 Customer registration completed successfully!')
    
    // Redirect to login with success message
    redirect('/login?message=' + encodeURIComponent('Account created successfully! Please check your email to verify your account.'))

  } catch (error) {
    console.error('💥 Unexpected error during registration:', error)
    redirect('/register/customer?error=' + encodeURIComponent(`Registration failed: ${error.message}`))
  }
}
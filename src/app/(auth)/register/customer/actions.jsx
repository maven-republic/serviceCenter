// app/(auth)/register/customer/actions.js
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../../../../utils/supabase/server'

// Add the email check server action
export async function checkEmailExists(formData) {
  const supabase = await createClient()
  
  // Add safeguard to handle both FormData and plain objects
  let email
  if (formData instanceof FormData) {
    email = formData.get('email')
  } else if (typeof formData === 'object') {
    email = formData.email
  } else {
    email = formData
  }  
  try {
    // Check the account table for existing email
    const { data, error } = await supabase
      .from('account')
      .select('email')
      .eq('email', email)
      .maybeSingle()
    
    if (error) {
      console.error('Error checking email:', error)
      return { exists: false, error: error.message }
    }
    
    // If data exists, the email is already registered
    return { exists: !!data, error: null }
  } catch (err) {
    console.error('Error in checkEmailExists:', err)
    return { exists: false, error: 'Failed to check email' }
  }
}

export async function signupCustomer(formData) {
  const supabase = await createClient()

  const firstName = formData.get('firstName')
  const lastName = formData.get('lastName')
  const userEmail = formData.get('email')
  const phoneNumber = formData.get('phone')
  const gender = formData.get('gender')
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')
  
  // Check if email already exists before signup
  const { exists, error: checkError } = await checkEmailExists(
    new FormData().append('email', userEmail)
  )
  
  if (checkError) {
    redirect('/register/customer?error=' + encodeURIComponent('Error checking email. Please try again.'))
  }
  
  if (exists) {
    redirect('/register/customer?error=' + encodeURIComponent('This email is already registered. Please use a different email or login.'))
  }
  
  // Sign up the user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: userEmail,
    password: password
  })

  if (error) {
    redirect('/register/customer?error=' + encodeURIComponent(error.message || 'Signup failed.'))
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
    redirect('/register/customer?error=' + encodeURIComponent('Failed to create account.'))
  }

  // Create account role - automatically set as customer
  const { error: roleError } = await supabase
    .from('account_role')
    .insert([{
      account_id: userId,
      role_type: 'customer',
      is_primary: true
    }])

  if (roleError) {
    redirect('/register/customer?error=' + encodeURIComponent('Failed to assign role.'))
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

  // Create customer profile
  const { error: customerError } = await supabase
    .from('individual_customer')
    .insert([{
      account_id: userId,
      gender: gender
    }])
  
  if (customerError) {
    redirect('/register/customer?error=' + encodeURIComponent('Failed to create customer profile.'))
  }

  redirect('/login')
}
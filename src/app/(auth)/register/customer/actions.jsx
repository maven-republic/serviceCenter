// app/(auth)/register/customer/actions.js
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../../../../utils/supabase/server'

export async function signupCustomer(formData) {
  const supabase = await createClient()

  const firstName = formData.get('firstName')
  const lastName = formData.get('lastName')
  const userEmail = formData.get('email')
  const phoneNumber = formData.get('phone')
  const gender = formData.get('gender')
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')
  
  // Add validation and user existence check
  
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
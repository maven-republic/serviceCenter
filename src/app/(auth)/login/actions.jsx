'use server'

import { redirect } from 'next/navigation'
import { useLoaderStore } from '@/store/loaderStore'
import { createClient } from '../../../../utils/supabase/server'

export async function login(formData) {
  const supabase = await createClient()

  const { startLoading, stopLoading } = useLoaderStore.getState()

  startLoading();
  
  // Extract email and password from form data
  const userEmail = formData.get('email')
  const userPassword = formData.get('password')

  // Validate email and password
  if (!userEmail || !userPassword) {
    stopLoading();
    redirect('/login?error=' + encodeURIComponent('Email and password are required.'))
  }

  // Sign in user with email and password
  const { data, error } = await supabase.auth.signInWithPassword({
    email: userEmail,
    password: userPassword,
  })
  
  // Handle Error
  if (error) {
    console.log('Supabase signIn error:', error.message);
    stopLoading();
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  // Add email verification synchronization here
  const user = data.user
  if (user.email_confirmed_at) {
    // Update account table to match authentication status
    const { error: syncError } = await supabase
      .from('account')
      .update({ email_verified: true })
      .eq('account_id', user.id)
    
    if (syncError) {
      console.error('Failed to sync email verification status:', syncError)
    }
  }

  // Fetch the user's primary role
  const { data: roleData, error: roleError } = await supabase
    .from('account_role')
    .select('role_type')
    .eq('account_id', user.id)
    .eq('is_primary', true)
    .single()
  
  if (roleError) {
    console.error('Failed to fetch user role:', roleError)
    stopLoading();
    redirect('/login?error=' + encodeURIComponent('Failed to retrieve user role'))
  }

  // Redirect based on role
  stopLoading();
  
  const role = roleData.role_type
  switch (role) {
    case 'customer':
      redirect('/customer/workspace')
    case 'professional':
      redirect('/professional/workspace') 
    case 'management':
      redirect('/management/workpace')
    default:
      redirect('/not-found') // Fallback for unknown roles
  }
}
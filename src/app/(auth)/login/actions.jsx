'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData) {
  const supabase = await createClient()

  const email = formData.get('email')
  const password = formData.get('password')

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Email and password are required.'))
  }

  console.log('🔍 Server action login attempt for:', email)

  // Sign in with persistent session
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: {
      shouldPersistSession: true
    }
  })

  if (error || !data?.user) {
    console.error('❌ Server login error:', error?.message)
    redirect('/login?error=' + encodeURIComponent(error?.message || 'Login failed.'))
  }

  console.log('✅ Server login successful for:', data.user.email)

  // Sync email verification status
  if (data.user.email_confirmed_at) {
    await supabase
      .from('account')
      .update({ email_verified: true })
      .eq('account_id', data.user.id)
  }

  // Get user role for redirect
  const { data: roleData, error: roleError } = await supabase
    .from('account_role')
    .select('role_type')
    .eq('account_id', data.user.id)
    .eq('is_primary', true)
    .single()

  if (roleError || !roleData?.role_type) {
    console.error('❌ Role lookup failed:', roleError)
    redirect('/login?error=' + encodeURIComponent('Unable to determine account type'))
  }

  const role = roleData.role_type
  console.log('👤 User role determined:', role)

  // Role-based redirect
  switch (role) {
    case 'customer':
      redirect('/customer/workspace')
    case 'professional':
      redirect('/professional/workspace')
    case 'admin':
      redirect('/admin/dashboard')
    default:
      redirect('/login?error=' + encodeURIComponent('Invalid account type'))
  }
}
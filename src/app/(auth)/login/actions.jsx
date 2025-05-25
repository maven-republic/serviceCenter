'use server'

import { redirect } from 'next/navigation'
import { useLoaderStore } from '@/store/loaderStore'
import { createClient } from '@/utils/supabase/server'

export async function login(formData) {
  const supabase = await createClient()

  const { startLoading, stopLoading } = useLoaderStore.getState()

  startLoading()

  const email = formData.get('email')
  const password = formData.get('password')

  if (!email || !password) {
    stopLoading()
    redirect('/login?error=' + encodeURIComponent('Email and password are required.'))
  }

  // ✅ Persist session explicitly
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: {
      shouldPersistSession: true
    }
  })

  if (error || !data?.user) {
    stopLoading()
    redirect('/login?error=' + encodeURIComponent(error?.message || 'Login failed.'))
  }

  // ✅ Sync email_verified if needed
  if (data.user.email_confirmed_at) {
    await supabase
      .from('account')
      .update({ email_verified: true })
      .eq('account_id', data.user.id)
  }

  // ✅ Get user role
  const { data: roleData, error: roleError } = await supabase
    .from('account_role')
    .select('role_type')
    .eq('account_id', data.user.id)
    .eq('is_primary', true)
    .single()

  if (roleError || !roleData?.role_type) {
    stopLoading()
    redirect('/login?error=' + encodeURIComponent('Role lookup failed'))
  }

  stopLoading()

  const role = roleData.role_type
  switch (role) {
    case 'customer':
      redirect('/customer/workspace')
    case 'professional':
      redirect('/professional/workspace')
    case 'admin':
      redirect('/admin/dashboard')
    default:
      redirect('/not-found')
  }
}

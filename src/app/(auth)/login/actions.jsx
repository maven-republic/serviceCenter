// ===== 1. UPDATED page.jsx =====
'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="auth-workspace">
      <Suspense fallback={<LoginLoadingFallback />}>
        <LoginInner />
      </Suspense>
    </div>
  )
}

function LoginLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <div className="auth-card animate-pulse">
          <div className="p-6 space-y-4">
            <div className="h-8 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-10 bg-muted rounded w-full"></div>
            <div className="h-10 bg-muted rounded w-full"></div>
            <div className="h-11 bg-muted rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginInner() {
  const searchParams = useSearchParams()
  const errorMessage = searchParams.get('error')

  return (
    <section className="our-login min-h-screen">
      <LoginForm errorMessage={errorMessage} />
    </section>
  )
}

// ===== 2. UPDATED actions.jsx (Server Actions) =====
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

  console.log('🔐 Server action login attempt for:', email)

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
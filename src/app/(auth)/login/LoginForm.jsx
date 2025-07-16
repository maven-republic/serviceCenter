// src/app/(auth)/login/LoginForm.jsx (FIXED VERSION)
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client' // ✅ Use YOUR Supabase client
import { useUserStore } from '@/store/userStore'

export default function LoginForm({ errorMessage }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    const email = e.target.email.value
    const password = e.target.password.value

    console.log('🔐 Attempting login for:', email)

    // ✅ Use the SAME Supabase client as the rest of your app
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        shouldPersistSession: true,
      },
    })

    console.log('🔐 Login result:', { data: !!data, error: error?.message })

    if (error) {
      console.error('❌ Login error:', error)
      router.push(`/login?error=${encodeURIComponent(error.message)}`)
      setLoading(false)
      return
    }

    if (!data?.user) {
      console.error('❌ No user returned from login')
      router.push(`/login?error=${encodeURIComponent('No user data returned')}`)
      setLoading(false)
      return
    }

    console.log('✅ Login successful for user:', data.user.email)

    try {
      // ✅ Hydrate the userStore immediately after login
      const fetchUser = useUserStore.getState().fetchUser
      console.log('🔄 Fetching user data for store...')
      await fetchUser(data.user, supabase)

      // ✅ Role-based redirect
      console.log('🔍 Looking up user role...')
      const { data: roleData, error: roleError } = await supabase
        .from('account_role')
        .select('role_type')
        .eq('account_id', data.user.id)
        .eq('is_primary', true)
        .single()

      console.log('👤 Role lookup result:', { roleData, roleError })

      if (roleError || !roleData?.role_type) {
        console.error('❌ Role lookup failed:', roleError)
        router.push('/login?error=Role lookup failed')
        setLoading(false)
        return
      }

      const role = roleData.role_type
      console.log('✅ User role determined:', role)

      // Add a small delay to ensure session is fully established
      await new Promise(resolve => setTimeout(resolve, 1000))

      switch (role) {
        case 'customer':
          console.log('↩️ Redirecting to customer workspace')
          router.replace('/customer/workspace')
          break
        case 'professional':
          console.log('↩️ Redirecting to professional workspace')
          router.replace('/professional/workspace')
          break
        case 'admin':
          console.log('↩️ Redirecting to admin dashboard')
          router.replace('/admin/dashboard')
          break
        default:
          console.log('❌ Unknown role, redirecting to 404')
          router.replace('/not-found')
      }
    } catch (error) {
      console.error('💥 Post-login processing error:', error)
      router.push(`/login?error=${encodeURIComponent('Login processing failed: ' + error.message)}`)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleLogin}>
      <div className="container">
        <div className="row">
          <div className="col-lg-6 m-auto wow fadeInUp" data-wow-delay="300ms">
            <div className="main-title text-center">
              <h2 className="title">Log In</h2>
            </div>
          </div>
        </div>
        <div className="row wow fadeInRight" data-wow-delay="300ms">
          <div className="col-xl-6 mx-auto">
            <div className="log-reg-form search-modal form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
              <div className="mb30">
                <h4>We're glad to see you again!</h4>
                <p className="text">
                  Don't have an account?{' '}
                  <a href="/register" className="text-thm">
                    Sign Up!
                  </a>
                </p>
              </div>
              <div className="mb20">
                <label className="form-label fw600 dark-color">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="mb15">
                <label className="form-label fw600 dark-color">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="*******"
                  required
                />
              </div>
              <div className="checkbox-style1 d-block d-sm-flex align-items-center justify-content-between mb20">
                <label className="custom_checkbox fz14 ff-heading">
                  Remember me
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark" />
                </label>
                <a className="fz14 ff-heading">Forgot Password?</a>
              </div>
              <div className="d-grid mb20">
                <button 
                  className="ud-btn btn-thm d-flex align-items-center justify-content-center gap-2" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    <>
                      Log In <i className="fal fa-arrow-right-long" />
                    </>
                  )}
                </button>
              </div>
              {errorMessage && (
                <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
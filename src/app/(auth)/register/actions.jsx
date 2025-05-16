'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function LoginForm({ errorMessage }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = useSupabaseClient()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    const email = e.target.email.value
    const password = e.target.password.value

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.error('Login error:', error.message)
      router.push(`/login?error=${encodeURIComponent(error.message)}`)
    } else {
      router.refresh() // rehydrates session
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleLogin}>
      {errorMessage && (
        <div className="alert alert-danger mb-4" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input type="email" name="email" className="form-control" required />
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input type="password" name="password" className="form-control" required />
      </div>

      <div className="d-grid mb-4">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </form>
  )
}

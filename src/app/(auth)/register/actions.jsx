// ===== 3. UPDATED LoginForm actions.jsx =====
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react'

export default function LoginForm({ errorMessage }) {
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState(null)
  const router = useRouter()
  const supabase = useSupabaseClient()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setLocalError(null)

    const email = e.target.email.value.trim()
    const password = e.target.password.value

    // Basic validation
    if (!email || !password) {
      setLocalError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          shouldPersistSession: true,
        },
      })

      if (error) {
        console.error('Login error:', error.message)
        setLocalError(error.message)
      } else {
        router.refresh() // rehydrates session
        router.push('/') // redirect to home or dashboard
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setLocalError('An unexpected error occurred. Please try again.')
    }

    setLoading(false)
  }

  const displayError = localError || errorMessage

  return (
    <div className="auth-workspace">
      <Card className="auth-card w-full max-w-md mx-auto">
        <CardHeader className="auth-card-header text-center">
          <CardTitle className="text-2xl font-bold text-card-foreground">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent className="auth-card-content">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Error Alert */}
            {displayError && (
              <Alert variant="destructive" className="alert alert-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <div className="form-group">
              <Label htmlFor="email" className="form-label">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="email" 
                  name="email" 
                  id="email"
                  className="form-control pl-10" 
                  placeholder="Enter your email"
                  required 
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <Label htmlFor="password" className="form-label">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  name="password" 
                  id="password"
                  className="form-control pl-10" 
                  placeholder="Enter your password"
                  required 
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="auth-button-primary w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Additional Options */}
            <div className="text-center pt-4">
              <a 
                href="/forgot-password" 
                className="text-sm text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              >
                Forgot your password?
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
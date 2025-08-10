// ===== UPDATED LoginForm.jsx =====
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useUserStore } from '@/store/userStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Loading Skeleton - Pure Tailwind
function LoginFormSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <div className="h-16 bg-muted rounded w-80 mx-auto animate-pulse" />
        </div>

        {/* Card Skeleton */}
        <Card className="bg-card border-border">
          <CardHeader className="text-center space-y-2">
            <div className="h-6 bg-muted rounded w-24 mx-auto animate-pulse" />
            <div className="h-4 bg-muted rounded w-full animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-24 animate-pulse" />
              <div className="h-10 bg-muted rounded w-full animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-20 animate-pulse" />
              <div className="h-10 bg-muted rounded w-full animate-pulse" />
            </div>
            <div className="h-11 bg-muted rounded w-full animate-pulse" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginForm({ errorMessage, isLoading = false }) {
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const router = useRouter()

  if (isLoading) {
    return <LoginFormSkeleton />
  }

  const validateForm = (email, password) => {
    const errors = {}
    
    if (!email?.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!password?.trim()) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    return errors
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setFormErrors({})

    const formData = new FormData(e.target)
    const email = formData.get('email')?.trim()
    const password = formData.get('password')

    // Client-side validation
    const errors = validateForm(email, password)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setLoading(false)
      return
    }

    console.log('🔐 Attempting login for:', email)

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          shouldPersistSession: rememberMe,
        },
      })

      if (error) {
        console.error('❌ Login error:', error)
        router.push(`/login?error=${encodeURIComponent(error.message)}`)
        setLoading(false)
        return
      }

      if (!data?.user) {
        console.error('❌ No user returned from login')
        router.push(`/login?error=${encodeURIComponent('Authentication failed')}`)
        setLoading(false)
        return
      }

      console.log('✅ Login successful for user:', data.user.email)

      // Hydrate userStore
      const fetchUser = useUserStore.getState().fetchUser
      await fetchUser(data.user, supabase)

      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('account_role')
        .select('role_type')
        .eq('account_id', data.user.id)
        .eq('is_primary', true)
        .single()

      if (roleError || !roleData?.role_type) {
        console.error('❌ Role lookup failed:', roleError)
        router.push('/login?error=Unable to determine account type')
        setLoading(false)
        return
      }

      const role = roleData.role_type
      
      // Small delay for session establishment
      await new Promise(resolve => setTimeout(resolve, 500))

      // Role-based redirect
      switch (role) {
        case 'customer':
          router.replace('/customer/workspace')
          break
        case 'professional':
          router.replace('/professional/workspace')
          break
        case 'admin':
          router.replace('/admin/dashboard')
          break
        default:
          router.replace('/not-found')
      }
    } catch (error) {
      console.error('💥 Login processing error:', error)
      router.push(`/login?error=${encodeURIComponent('Login processing failed')}`)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header with maven republic text */}
        <div className="text-center space-y-4 flex flex-col items-center">
          <h1 className="text-7xl font-bold tracking-tight text-muted-foreground whitespace-nowrap">
            maven republic
          </h1>
        </div>

        {/* Login Card - Pure shadcn/ui */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-xl text-card-foreground">Sign In</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Global Error - shadcn/ui Alert */}
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {/* Email Field - Pure Tailwind + shadcn/ui */}
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-sm font-medium text-foreground"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className={cn(
                      "pl-10 bg-background border-border text-foreground",
                      "placeholder:text-muted-foreground",
                      "focus:border-ring focus:ring-2 focus:ring-ring/20",
                      formErrors.email && "border-destructive focus:border-destructive"
                    )}
                    disabled={loading}
                    required
                  />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Password Field - Pure Tailwind + shadcn/ui */}
              <div className="space-y-2">
                <Label 
                  htmlFor="password" 
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={cn(
                      "pl-10 pr-10 bg-background border-border text-foreground",
                      "placeholder:text-muted-foreground",
                      "focus:border-ring focus:ring-2 focus:ring-ring/20",
                      formErrors.password && "border-destructive focus:border-destructive"
                    )}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                    disabled={loading}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-xs text-destructive mt-1">{formErrors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password - Pure Tailwind */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    disabled={loading}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label 
                    htmlFor="remember" 
                    className="text-sm font-medium text-foreground cursor-pointer select-none"
                  >
                    Remember me
                  </Label>
                </div>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button - Pure shadcn/ui */}
              <Button 
                type="submit" 
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links - Pure Tailwind */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link 
              href="/register" 
              className="font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
            >
              Create Account
            </Link>
          </p>
          
          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <Link 
              href="/terms" 
              className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
            >
              Terms
            </Link>
            <span>•</span>
            <Link 
              href="/privacy" 
              className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
            >
              Privacy
            </Link>
            <span>•</span>
            <Link 
              href="/help" 
              className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
            >
              Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
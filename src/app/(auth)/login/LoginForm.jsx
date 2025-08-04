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
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Loader2, ArrowRight } from 'lucide-react'

// Loading Skeleton Component
function LoginFormSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Skeleton className="h-16 w-80" /> {/* maven republic skeleton */}
          <Skeleton className="h-4 w-64" /> {/* subtitle skeleton */}
        </div>

        {/* Login Card Skeleton */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="space-y-1">
            <Skeleton className="h-8 w-32" /> {/* title skeleton */}
            <Skeleton className="h-4 w-full" /> {/* description skeleton */}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email Field Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" /> {/* label skeleton */}
              <Skeleton className="h-10 w-full" /> {/* input skeleton */}
            </div>

            {/* Password Field Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" /> {/* label skeleton */}
              <Skeleton className="h-10 w-full" /> {/* input skeleton */}
            </div>

            {/* Remember Me & Forgot Password Skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" /> {/* checkbox skeleton */}
                <Skeleton className="h-4 w-24" /> {/* remember me text */}
              </div>
              <Skeleton className="h-4 w-28" /> {/* forgot password link */}
            </div>

            {/* Submit Button Skeleton */}
            <Skeleton className="h-11 w-full" /> {/* button skeleton */}
          </CardContent>
        </Card>

        {/* Sign Up Link Skeleton */}
        <div className="text-center">
          <Skeleton className="h-4 w-48 mx-auto" /> {/* sign up text skeleton */}
        </div>
      </div>
    </div>
  )
}

export default function LoginForm({ errorMessage, isLoading = false }) {
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  // Show skeleton while initial loading
  if (isLoading) {
    return <LoginFormSkeleton />
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.target)
    const email = formData.get('email')
    const password = formData.get('password')

    console.log('🔐 Attempting login for:', email)

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
      // Hydrate the userStore immediately after login
      const fetchUser = useUserStore.getState().fetchUser
      console.log('🔄 Fetching user data for store...')
      await fetchUser(data.user, supabase)

      // Role-based redirect
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <h1 className="text-7xl font-bold tracking-tight text-muted-foreground whitespace-nowrap">
            maven republic
          </h1>
          
        </div>

        {/* Login Card */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="space-y-1">
            
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full"
                  disabled={loading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="w-full"
                  disabled={loading}
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    disabled={loading}
                  />
                  <Label 
                    htmlFor="remember" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </Label>
                </div>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    SIGN IN
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Have an account?{' '}
            <Link 
              href="/register" 
              className="font-medium text-primary hover:underline"
            >
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
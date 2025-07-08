// ============================================
// ConfirmPassword.jsx - Tailwind + shadcn/ui Version
// ============================================
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function ConfirmPassword() {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      console.log('Account closure confirmed with password:', password)
    }, 2000)
  }

  return (
    <Card className="mb-6 border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Close Account
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4 max-w-lg">
          {/* Warning Message */}
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <h3 className="font-semibold text-destructive mb-2">Warning</h3>
            <p className="text-sm text-muted-foreground">
              If you close your account, you will be unsubscribed from all your 5 courses, 
              and will lose access forever. This action cannot be undone.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Confirmation */}
            <div className="space-y-2">
              <Label htmlFor="confirmAccountPassword" className="text-sm font-medium">
                Enter Password to Confirm
              </Label>
              <div className="relative">
                <Input
                  id="confirmAccountPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password to confirm account closure"
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                variant="destructive"
                disabled={isLoading || !password}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Closing Account...
                  </>
                ) : (
                  <>
                    Close Account Permanently
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
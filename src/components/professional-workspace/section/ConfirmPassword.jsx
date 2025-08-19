// ============================================
// ConfirmPassword.jsx - Mobile Responsive Version
// ============================================
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowRight, Eye, EyeOff, Lock, Shield } from 'lucide-react'

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
    <div className="w-full max-w-none sm:max-w-2xl mx-auto px-4 sm:px-0">
      <Card className="mb-4 sm:mb-6 border-destructive/20 shadow-lg">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-semibold text-destructive">
            <div className="flex-shrink-0 p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="leading-tight">Close Account</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="space-y-4 sm:space-y-6">
            {/* Enhanced Warning Message - Mobile Responsive */}
            <div className="p-4 sm:p-6 bg-gradient-to-br from-destructive/5 to-red-50 dark:from-destructive/10 dark:to-red-950/20 border border-destructive/20 rounded-lg sm:rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 p-1.5 rounded-lg bg-destructive/10">
                  <Shield className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-destructive text-sm sm:text-base mb-2">
                    ⚠️ Critical Warning
                  </h3>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  If you close your account, you will be unsubscribed from all your 5 courses, 
                  and will lose access forever. This action cannot be undone.
                </p>
                
                {/* Additional consequences list - Mobile friendly */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-destructive/80">What you'll lose:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• All course progress and certificates</li>
                    <li>• Premium subscription benefits</li>
                    <li>• Account data and preferences</li>
                    <li>• Access to community features</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Password Confirmation - Mobile Enhanced */}
              <div className="space-y-2 sm:space-y-3">
                <Label 
                  htmlFor="confirmAccountPassword" 
                  className="text-sm sm:text-base font-medium flex items-center gap-2"
                >
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Enter Password to Confirm
                </Label>
                
                <div className="relative">
                  <Input
                    id="confirmAccountPassword"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pr-12 sm:pr-14 h-12 sm:h-11 text-base sm:text-sm bg-background"
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-9 sm:w-9 hover:bg-muted/50 rounded-md"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                
                {/* Helper text */}
                <p className="text-xs text-muted-foreground">
                  This confirms your identity before permanently deleting your account.
                </p>
              </div>

              {/* Submit Button - Mobile Responsive */}
              <div className="pt-2 sm:pt-4 space-y-3">
                <Button 
                  type="submit" 
                  variant="destructive"
                  disabled={isLoading || !password}
                  className="w-full h-12 sm:h-11 gap-2 sm:gap-3 text-base sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="text-sm sm:text-base">Closing Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Close Account Permanently</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                
                {/* Additional safety note - Mobile */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Tip:</strong> Consider downloading your data first
                  </p>
                </div>
              </div>
            </form>

            {/* Alternative actions - Mobile friendly */}
            <div className="pt-4 border-t border-border">
              <div className="text-center space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Need help or want to keep your account?
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-9 px-4"
                    onClick={() => console.log('Contact support')}
                  >
                    Contact Support
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-9 px-4"
                    onClick={() => console.log('Export data')}
                  >
                    Export My Data
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
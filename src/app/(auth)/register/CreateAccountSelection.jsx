// ===== MOBILE-RESPONSIVE CreateAccountSelection.jsx =====
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Briefcase, ArrowRight, CheckCircle } from 'lucide-react'

export default function CreateAccountSelection() {
  return (
    <div className="auth-workspace">
      {/* Mobile: scrollable layout, Desktop: centered */}
      <div className="bg-background px-4 py-4 pb-8 min-h-screen sm:py-12 sm:flex sm:items-center sm:justify-center">
        <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-8">
          
          {/* Header - Responsive */}
          <div className="text-center space-y-2 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Create your Account
            </h1>
            
          </div>

          {/* Selection Cards - Mobile optimized */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Customer Card - Mobile optimized */}
            <Card className="auth-card">
              <CardHeader className="text-center pb-3 sm:pb-4 p-4 sm:p-6">
                <div className="mx-auto w-12 sm:w-16 h-12 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <Users className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-card-foreground">Customer</CardTitle>
                <CardDescription className="text-sm sm:text-base text-muted-foreground">
                  Looking for services from professionals
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0 p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Benefits list - Compact on mobile */}
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-2 sm:space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="leading-relaxed">Browse professional services</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="leading-relaxed">Post project requirements</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="leading-relaxed">Connect with trusted experts</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="leading-relaxed">Secure payment protection</span>
                    </li>
                  </ul>
                  
                  {/* Button - Touch optimized */}
                  <Button asChild className="auth-button-primary px-4 py-2 w-full h-12">
                    <Link href="/register/customer">
                      Create Customer Account
                      <ArrowRight className="ml-2 h-3 sm:h-4 w-3 sm:w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Professional Card - Mobile optimized */}
            <Card className="auth-card">
              <CardHeader className="text-center pb-3 sm:pb-4 p-4 sm:p-6">
                <div className="mx-auto w-12 sm:w-16 h-12 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <Briefcase className="h-6 sm:h-8 w-6 sm:w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-card-foreground">Professional</CardTitle>
                <CardDescription className="text-sm sm:text-base text-muted-foreground">
                  Offering your professional services
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0 p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Benefits list - Compact on mobile */}
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-2 sm:space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="leading-relaxed">Showcase your expertise</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="leading-relaxed">Find qualified clients</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="leading-relaxed">Grow your business</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="leading-relaxed">Flexible scheduling tools</span>
                    </li>
                  </ul>
                  
                  {/* Button - Touch optimized */}
                  <Button asChild className="auth-button-primary px-4 py-2 w-full h-12">
                    <Link href="/register/professional">
                      Create Professional Account
                      <ArrowRight className="ml-2 h-3 sm:h-4 w-3 sm:w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer - Mobile optimized */}
          <div className="text-center space-y-3 sm:space-y-4 pb-4 sm:pb-0">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center">
                <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                Free to join
              </span>
              <span className="flex items-center">
                <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                Secure platform
              </span>
              <span className="flex items-center">
                <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                24/7 support
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm touch-manipulation"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
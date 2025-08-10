// register/CreateAccountSelection.jsx
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Briefcase, ArrowRight, CheckCircle } from 'lucide-react'

export default function CreateAccountSelection() {
  return (
    <div className="auth-workspace">
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-4xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="responsive-heading-1 text-foreground">
              Create your Account
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the account type that best describes your needs
            </p>
          </div>

          {/* Selection Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer Card */}
            <Card className="auth-card h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl text-card-foreground">Customer</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Looking for services from professionals
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  <ul className="text-sm text-muted-foreground space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                      Browse professional services
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                      Post project requirements
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                      Connect with trusted experts
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                      Secure payment protection
                    </li>
                  </ul>
                  <Button asChild className="auth-button-primary w-full h-12 text-base">
                    <Link href="/register/customer">
                      Create Customer Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Professional Card */}
            <Card className="auth-card h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl text-card-foreground">Professional</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Offering your professional services
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  <ul className="text-sm text-muted-foreground space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                      Showcase your expertise
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                      Find qualified clients
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                      Grow your business
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                      Flexible scheduling tools
                    </li>
                  </ul>
                  <Button asChild className="auth-button-primary w-full h-12 text-base">
                    <Link href="/register/professional">
                      Create Professional Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <span>✓ Free to join</span>
              <span>✓ Secure platform</span>
              <span>✓ 24/7 support</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
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
// app/(auth)/register/customer/success/page.jsx
import Link from 'next/link'
import { CheckCircle, ArrowRight, Mail, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function CustomerRegistrationSuccess({ searchParams }) {
  const resolvedParams = await searchParams
  const message = resolvedParams?.message || 'Account created successfully!'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="text-center">
          <CardHeader className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-green-800">
                Welcome to ServiceCenter!
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                {message}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Next Steps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What's Next?</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="font-medium">Check Your Email</h4>
                  <p className="text-sm text-muted-foreground">
                    We've sent you a verification email. Click the link to verify your account.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <h4 className="font-medium">Secure Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Your account is protected with industry-standard security measures.
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Benefits</h3>
              
              <div className="text-left space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Find Trusted Professionals</p>
                    <p className="text-sm text-muted-foreground">Access vetted service providers in your area</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Secure Payments</p>
                    <p className="text-sm text-muted-foreground">Safe and secure payment processing</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">24/7 Support</p>
                    <p className="text-sm text-muted-foreground">Get help whenever you need it</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Easy Booking</p>
                    <p className="text-sm text-muted-foreground">Book services with just a few clicks</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="flex-1 sm:flex-none">
                <Link href="/login">
                  Sign In to Your Account
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="flex-1 sm:flex-none">
                <Link href="/">
                  Browse Services
                </Link>
              </Button>
            </div>

            {/* Additional Help */}
            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Need help? Contact our support team at{' '}
                <a href="mailto:support@servicecenter.com" className="text-primary hover:underline">
                  support@servicecenter.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
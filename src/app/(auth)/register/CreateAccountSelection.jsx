// register/CreateAccountSelection.jsx
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Briefcase, ArrowRight } from 'lucide-react'

export default function CreateAccountSelection() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Create your Account</h1>
          
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer Card */}
          <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary/20">
            <CardHeader className="text-center pb-4">
             
              <CardTitle className="text-2xl">Customer</CardTitle>
              <CardDescription className="text-base">
                Looking for services from professionals
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                    Browse professional services
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                    Post project requirements
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                    Connect with experts
                  </li>
                </ul>
                <Button asChild className="w-full h-12 text-base">
                  <Link href="/register/customer">
                    Create your customer account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Professional Card */}
          <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary/20">
            <CardHeader className="text-center pb-4">
              
              <CardTitle className="text-2xl">Professional</CardTitle>
              <CardDescription className="text-base">
                Offering your professional services
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                    Showcase your expertise
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                    Find new clients
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                    Grow your business
                  </li>
                </ul>
                <Button asChild className="w-full h-12 text-base">
                  <Link href="/register/professional">
                    Create your professional account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Have an account?{' '}
            <Link 
              href="/login" 
              className="font-medium text-primary hover:underline"
            >
              SIGN IN
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
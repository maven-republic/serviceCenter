import Link from "next/link"
import { ArrowRight, CheckCircle } from 'lucide-react'

export default function RegisterSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Selection Cards */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Customer Card */}
          <div className="relative">
            <div className="bg-card border border-border rounded-3xl p-8 lg:p-10 h-full flex flex-col animate-fade-in">
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-4">Customer</h3>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Looking for professional services? Connect with verified experts who can help bring your projects to life.
                </p>
                
                {/* Features */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>Browse verified professionals</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>Secure project management</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>Protected payments</span>
                  </li>
                </ul>
              </div>
              
              {/* CTA Button */}
              <Link 
                href="/register/customer"
                className="w-full h-14 bg-foreground text-background rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Sign up as Customer</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Professional Card */}
          <div className="relative">
            <div className="bg-card border border-border rounded-3xl p-8 lg:p-10 h-full flex flex-col animate-fade-in">
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-4">Professional</h3>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Ready to showcase your expertise? Join our network of professionals and grow your business.
                </p>
                
                {/* Features */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>Create your professional profile</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>Receive qualified leads</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>Streamlined invoicing</span>
                  </li>
                </ul>
              </div>
              
              {/* CTA Button */}
              <Link 
                href="/register/professional"
                className="w-full h-14 bg-foreground text-background rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Sign up as Professional</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-medium text-foreground hover:text-muted-foreground transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
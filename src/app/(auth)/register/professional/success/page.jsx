import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserCheck, Mail, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ProfessionalAccountCreationSuccess() {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      
      {/* Left Column - Success Message */}
      <div className="flex items-center justify-center w-full md:w-1/2 bg-card px-4 md:px-8 py-8 md:py-12">
        <div className="w-full max-w-md space-y-6">
          
          {/* Success Icon */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
              <UserCheck className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          {/* Welcome Message */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Welcome to Maven Republic
            </h1>
            <h2 className="text-lg md:text-xl font-semibold text-primary">
              Get paid for good work.
            </h2>
          </div>

          {/* Success Status */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Account Created Successfully!</p>
                  <p className="text-sm text-green-700">You're all set to start earning.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Verification Instructions */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Check Your Email</span>
              </div>
              
              <div className="space-y-2 text-sm text-blue-800">
                <p>Please verify your account to start receiving client requests.</p>
                <div className="flex items-center gap-2">
                 
                  <span>Check your <strong>spam folder</strong> if you don't see our email.</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sign In Button */}
          <div className="space-y-3">
            <Button asChild className="w-full h-12 text-base font-semibold">
              <Link href="/login">
                Sign In to Your Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            
            <p className="text-center text-xs text-muted-foreground">
              Ready to start your professional journey
            </p>
          </div>

          {/* Next Steps Preview */}
          <div className="pt-4 border-t">
            <h3 className="font-medium text-sm text-foreground mb-3">What's Next?</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Verify your email address</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"></div>
                <span>Complete your professional profile</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"></div>
                <span>Start receiving client requests</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Hero Image */}
      <div 
        className="hidden md:block w-full md:w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage: "url('/images/black-man-working.jpg')",
        }}
      >
        {/* Overlay for better text contrast if needed */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Optional: Add a quote or testimonial */}
        <div className="absolute bottom-8 left-8 right-8">
          <Card className="bg-white/90 backdrop-blur-sm border-white/50">
            <CardContent className="p-4">
              <blockquote className="text-sm italic text-foreground">
                "Maven Republic connected me with amazing clients. I've grown my business beyond what I thought possible."
              </blockquote>
              <cite className="text-xs text-muted-foreground mt-2 block">
                — Professional Service Provider
              </cite>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
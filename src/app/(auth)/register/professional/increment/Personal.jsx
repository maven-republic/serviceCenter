'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Personal({
  formData,
  errors,
  updateFormData,
  handleBlur
}) {
  return (
<div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[70vh]">
      
      {/* Left column: Explanation */}
      <div className="lg:col-span-2 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Personal Information</h2>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Tell clients about yourself. Your personal information helps establish your identity and builds trust with potential clients.
          </p>
        </div>

        {/* Compact Info Card */}
        <Card className="bg-muted/30">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-medium">Why this matters</p>
                <p className="text-xs text-muted-foreground">
                  Complete profiles receive 3x more client inquiries.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column: Form fields */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-4 w-4" />
              Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={updateFormData}
                onBlur={handleBlur}
                placeholder="you@example.com"
                className={cn(
                  errors.email && 'border-destructive focus-visible:ring-destructive'
                )}
              />
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Name Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* First Name */}
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </Label>
                <Input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={updateFormData}
                  onBlur={handleBlur}
                  placeholder="John"
                  className={cn(
                    errors.firstName && 'border-destructive focus-visible:ring-destructive',
                    formData.firstName && !errors.firstName && 'border-green-500 focus-visible:ring-green-500'
                  )}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.firstName}
                  </p>
                )}
                {formData.firstName && !errors.firstName && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Looks good!
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </Label>
                <Input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={updateFormData}
                  onBlur={handleBlur}
                  placeholder="Smith"
                  className={cn(
                    errors.lastName && 'border-destructive focus-visible:ring-destructive',
                    formData.lastName && !errors.lastName && 'border-green-500 focus-visible:ring-green-500'
                  )}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.lastName}
                  </p>
                )}
                {formData.lastName && !errors.lastName && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Looks good!
                  </p>
                )}
              </div>

            </div>

            {/* Compact Progress indicator */}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Profile completion</span>
                <span className="font-medium">
                  {[formData.email, formData.firstName, formData.lastName]
                    .filter(Boolean).length} / 3
                </span>
              </div>
              <div className="mt-1 w-full bg-muted rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${([formData.email, formData.firstName, formData.lastName]
                      .filter(Boolean).length / 3) * 100}%` 
                  }}
                />
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
'use client'
import React from 'react'
import Link from 'next/link'
import Contact from './Contact'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function Account({ formData, updateFormData, errors, handleBlur }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        
        {/* Left column: Visual/Brand Section */}
        <div className="hidden lg:flex items-center justify-center relative p-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          {/* Overlay for better visual hierarchy */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
          
          {/* Content overlay */}
          <div className="relative z-10 text-center space-y-6 px-8">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM8 14v.01M12 14v.01M16 14v.01"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Join Our Professional Network
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Connect with clients, showcase your expertise, and grow your business with our platform.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Form content */}
        <div className="flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-md space-y-6">
            
            {/* Header */}
            <div className="text-center lg:text-left space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Create your professional account
              </h1>
              <p className="text-muted-foreground">
                Join our platform to connect with clients looking for your professional services.
              </p>
            </div>

            {/* Form Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                
                {/* Contact Component */}
                <Contact
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                  handleBlur={handleBlur}
                />

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={updateFormData}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={updateFormData}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>

              </CardContent>
            </Card>

            {/* Login link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Log In!
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
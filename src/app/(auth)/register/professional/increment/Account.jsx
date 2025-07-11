'use client'
import React from 'react'
import Link from 'next/link'
import Contact from './Contact'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function Account({ formData, updateFormData, errors, handleBlur }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Left column: Visual/Brand Section */}
      <div className="hidden lg:flex items-center justify-center relative p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-lg">
        {/* Content overlay */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary"
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
            <h2 className="text-xl font-bold text-foreground mb-2">
              Join Our Professional Network
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Connect with clients, showcase your expertise, and grow your business with our platform.
            </p>
          </div>
        </div>
      </div>

      {/* Right column: Form content */}
      <div className="space-y-4">
        
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">
            Create your professional account
          </h1>
          <p className="text-sm text-muted-foreground">
            Join our platform to connect with clients looking for your professional services.
          </p>
        </div>

        {/* Form Card */}
        <Card>
          <CardContent className="p-4 space-y-3">
            
            {/* Contact Component */}
            <Contact
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              handleBlur={handleBlur}
            />

            {/* Password */}
            <div className="space-y-1">
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
            <div className="space-y-1">
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
  )
}
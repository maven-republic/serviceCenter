'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="auth-workspace">
      <Suspense fallback={<LoginLoadingFallback />}>
        <LoginInner />
      </Suspense>
    </div>
  )
}

function LoginLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <div className="auth-card animate-pulse">
          <div className="p-6 space-y-4">
            <div className="h-8 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-10 bg-muted rounded w-full"></div>
            <div className="h-10 bg-muted rounded w-full"></div>
            <div className="h-11 bg-muted rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginInner() {
  const searchParams = useSearchParams()
  const errorMessage = searchParams.get('error')

  return (
    <section className="our-login ">
      <LoginForm errorMessage={errorMessage} />
    </section>
  )
}
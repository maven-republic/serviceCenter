'use client'

import Footer from "@/components/footer/Footer"
import Header20 from "@/components/header/Header20"
import LoginForm from './LoginForm'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginInner />
    </Suspense>
  )
}

function LoginInner() {
  const searchParams = useSearchParams()
  const errorMessage = searchParams.get('error')

  return (
    <div>
      <Header20 />
      <section className="our-login">
        <LoginForm errorMessage={errorMessage} />
      </section>
      <Footer />
    </div>
  )
}

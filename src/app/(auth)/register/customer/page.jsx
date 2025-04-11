// app/(auth)/register/customer/page.jsx
import { redirect } from 'next/navigation'
import { createClient } from '../../../../../utils/supabase/server'
import Header from "@/components/header/Header20"
import Footer from "@/components/footer/Footer"
import CustomerRegistrationForm from './CustomerRegistrationForm'

export default async function CustomerRegistrationPage({ searchParams }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  // If a user is already logged in, redirect to the dashboard
  if (data?.user) {
    redirect('/dashboard')
  }

  // Read error message from query parameters, if any
  const errorMessage = searchParams?.error || null

  return (
    <div className="bgc-thm4">
      <Header />
      <section className="our-register">
        <CustomerRegistrationForm errorMessage={errorMessage} />
      </section>
      <Footer />
    </div>
  )
}
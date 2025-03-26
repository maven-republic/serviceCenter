
import Footer from "@/components/footer/Footer"
import Header20 from "@/components/header/Header20"
import { redirect } from 'next/navigation'
import { createClient } from '../../../../utils/supabase/server'
import RegisterForm from './RegisterForm'

export default async function Page({ searchParams }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  // If a user is already logged in, redirect to the dashboard.
  if (data?.user) {
    redirect('/dashboard')
  }

  // Read error message from query parameters, if any.
  const errorMessage = searchParams?.error || null

  return (
    <div className="bgc-thm4">
      <Header20 />
      <section className="our-register">
        <RegisterForm errorMessage={errorMessage} />
      </section>
      <Footer />
    </div>
  )
}


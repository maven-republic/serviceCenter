// app/(auth)/register/customer/page.jsx
import { redirect } from 'next/navigation'
import { createClient } from '../../../../../utils/supabase/server'
import Header from "@/components/header/Header20"
import Footer from "@/components/footer/Footer"
import CustomerAccountCreationForm from './CustomerAccountCreationForm'

export default async function CustomerAccountCreationInterface({ searchParams }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (data?.user) {
    redirect('/dashboard')
  }

  const resolvedParams = await searchParams
  const errorMessage = resolvedParams?.error || null

  return (
    <div className="bgc-thm4">
      <Header />
      <section className="our-register">
        <CustomerAccountCreationForm errorMessage={errorMessage} />
      </section>
      <Footer />
    </div>
  )
}

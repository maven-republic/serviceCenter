import Footer from "@/components/footer/Footer"
import Header20 from "@/components/header/Header20"
import { redirect } from 'next/navigation'
import { createClient } from '../../../../utils/supabase/server'
import LoginForm from './LoginForm'

export default async function page({searchParams}) {
  const supabase = await createClient()

  const { data } = await supabase.auth.getUser()
  if (data?.user) {
    redirect('/dashboard')
  }

   // Read error message from the query parameters, if any.
   const errorMessage = searchParams?.error || null
 
  return (
    <div className="">
      <Header20 />
      <section className="our-login">
        <LoginForm errorMessage={errorMessage}/>
      </section>
      <Footer />
    </div>
  )
}
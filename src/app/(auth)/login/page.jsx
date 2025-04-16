// Login page component
import Footer from "@/components/footer/Footer"
import Header20 from "@/components/header/Header20"
import { redirect } from 'next/navigation'
import { createClient } from '../../../../utils/supabase/server'
import LoginForm from './LoginForm'

export default async function page({searchParams}) {
  const supabase = await createClient()

  // Check if user is logged in
  const { data } = await supabase.auth.getUser()
  
  if (data?.user) {
    // Fetch the user's role to determine where to redirect them
    const { data: roleData, error: roleError } = await supabase
      .from('account_role')
      .select('role_type')
      .eq('account_id', data.user.id)
      .eq('is_primary', true)
      .single()
    
    if (!roleError) {
      // Redirect based on role
      switch (roleData.role_type) {
        case 'customer':
          redirect('/customer/workspace')
        case 'professional':
          redirect('/professional/workspace')
        case 'admin':
          redirect('/admin/dashboard')
        default:
          redirect('/not-found') // Fallback
      }
    } else {
      // If there's an error fetching role, use a default redirect
      redirect('/not-found')
    }
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
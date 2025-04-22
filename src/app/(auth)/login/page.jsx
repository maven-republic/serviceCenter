// Login page component
import Footer from "@/components/footer/Footer"
import Header20 from "@/components/header/Header20"
import { redirect } from 'next/navigation'
import { createClient } from '../../../../utils/supabase/server'
import LoginForm from './LoginForm'


export default async function page({ searchParams }) {
  const supabase = await createClient()

  const { data } = await supabase.auth.getUser()

  if (data?.user) {
    const { data: roleData, error: roleError } = await supabase
      .from('account_role')
      .select('role_type')
      .eq('account_id', data.user.id)
      .eq('is_primary', true)
      .single()

    if (!roleError) {
      switch (roleData.role_type) {
        case 'customer':
          redirect('/customer/workspace')
        case 'professional':
          redirect('/professional/workspace')
        case 'admin':
          redirect('/admin/dashboard')
        default:
          redirect('/not-found')
      }
    } else {
      redirect('/not-found')
    }
  }

  // ✅ Await searchParams properly here
  const { error: errorMessage } = await searchParams

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

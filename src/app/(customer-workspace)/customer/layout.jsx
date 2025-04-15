// app/(customer)/customer/layout.jsx
import { redirect } from 'next/navigation'

import { createClient } from '../../../../utils/supabase/server'

export default async function WorkspaceLayout({ children }) {
  const supabase = await createClient()
  
  // Check if the user is logged in
  const { data: authData } = await supabase.auth.getUser()
  if (!authData?.user) {
    return redirect('/login')
  }
  
  // Verify the user has the customer role
  const { data: roleData, error } = await supabase
    .from('account_role')
    .select('role_type')
    .eq('account_id', authData.user.id)
    .eq('is_primary', true)
    .single()
  
  if (error || roleData.role_type !== 'customer') {
    // Either redirect to access denied page or to appropriate dashboard
    return redirect('/access-denied')
  }
  
  return (
    <div className="customer-layout">
      {/* Customer-specific navigation and layout */}
      <nav className="customer-nav">
        {/* Customer navigation items */}
      </nav>
      <main>{children}</main>
    </div>
  )
}
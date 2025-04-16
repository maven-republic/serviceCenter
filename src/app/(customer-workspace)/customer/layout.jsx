// app/(professional-workspace)/professional/workspace/layout.jsx
import { redirect } from 'next/navigation'
import { createClient } from '../../../../utils/supabase/server'
import CustomerWorkspaceLayout from "@/components/customer-workspace/CustomerWorkspaceLayout"
import MobileNavigation2 from "@/components/header/MobileNavigation2"

export const metadata = {
  title: "Customer Workspace",
};

export default async function WorkspaceLayout({ children }) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    redirect('/login')
  }
  
  // Optional: Check if user has professional role
  const { data: roleData } = await supabase
    .from('account_role')
    .select('role_type')
    .eq('account_id', data.user.id)
    .eq('is_primary', true)
    .single()
  
  if (roleData?.role_type !== 'customer') {
    redirect('/login')
  }

  return (
    <>
      <MobileNavigation2 />
      <CustomerWorkspaceLayout>
        {children}
      </CustomerWorkspaceLayout>
    </>
  );
}
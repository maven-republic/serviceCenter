// app/(professional-workspace)/professional/workspace/layout.jsx
import { redirect } from 'next/navigation'
import { createClient } from '../../../../utils/supabase/server'
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import MobileNavigation2 from "@/components/header/MobileNavigation2"

export const metadata = {
  title: "Freeio - Professional Workspace",
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
  
  if (roleData?.role_type !== 'professional') {
    redirect('/login')
  }

  return (
    <>
      <MobileNavigation2 />
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </>
  );
}
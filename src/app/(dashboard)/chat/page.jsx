import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ChatProvider from "@/components/dashboard/section/ChatProvider";
import { redirect } from 'next/navigation'
import MobileNavigation2 from "@/components/header/MobileNavigation2";
import { createClient } from '../../../../utils/supabase/server'

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Add Service",
};

export default async function page() {

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  const { data: account, accError } = await supabase
  .from('account')
  .select('*')
  .eq('account_id', data.user.id)
  .single();
 
  const user = {
    id: data.user.id,
    name: account?.first_name + ' ' + account?.last_name,
  }

  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout> 
        <ChatProvider user={user} />
      </DashboardLayout>
    </>
  );
}

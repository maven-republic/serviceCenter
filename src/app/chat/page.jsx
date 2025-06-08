import DashboardLayout from "@/components/professional-workspace/DashboardLayout";
import ChatProvider from "@/components/chat/ChatProvider";
import { redirect } from 'next/navigation'
import MobileNavigation2 from "@/components/header/MobileNavigation2";
import { createClient } from '@/utils/supabase/server' 
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

  const otherUser = {
    id: undefined,
    name: undefined,
  }

  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout> 
        <ChatProvider user={user} otherUserData={otherUser}/>
      </DashboardLayout>
    </>
  );
}

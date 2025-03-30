import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardInfo from "@/components/dashboard/section/DashboardInfo";
import { redirect } from 'next/navigation'
import { createClient } from '../../../../utils/supabase/server'
import MobileNavigation2 from "@/components/header/MobileNavigation2";


export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Dashboard",
};

export default async function page() {
    
    const supabase = await createClient()
  
    const { data, error } = await supabase.auth.getUser()
 
    
    if (error || !data?.user) {
      redirect('/login')
    }

  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <DashboardInfo />
      </DashboardLayout>
    </>
  );
}

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AddServiceInfo from "@/components/dashboard/section/AddServiceInfo";
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
console.log("data: ",data)

  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <AddServiceInfo />
      </DashboardLayout>
    </>
  );
}

import DashboardLayout from "@/components/professional-workspace/DashboardLayout";
import AddServiceInformation from "@/components/professional-workspace/section/AddServiceInformation";
import { redirect } from 'next/navigation'
import MobileNavigation2 from "@/components/header/MobileNavigation2";
import { createClient } from '@/utils/supabase/server'

export const metadata = {
  title: " Add Service",
};

export default async function Page() {
  const supabase = await createClient()

  // ✅ use getSession instead of getUser
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session?.user) {
    redirect('/login')
  }

  return (
    <>
      {/* <MobileNavigation2 /> */}
      {/* <DashboardLayout> */}
        <AddServiceInformation />
      {/* </DashboardLayout> */}
    </>
  );
}

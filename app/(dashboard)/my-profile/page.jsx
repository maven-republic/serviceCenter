import DashboardLayout from "@/components/store/dashboard/DashboardLayout";
import MyProfileInfo from "@/components/store/dashboard/section/MyProfileInfo";

import MobileNavigation from "@/components/store/header/MobileNavigation";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | My Profile",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation />
      <DashboardLayout>
        <MyProfileInfo />
      </DashboardLayout>
    </>
  );
}

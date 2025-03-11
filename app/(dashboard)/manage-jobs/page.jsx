import DashboardLayout from "@/components/store/dashboard/DashboardLayout";
import ManageJobInfo from "@/components/store/dashboard/section/ManageJobInfo";

import MobileNavigation from "@/components/store/header/MobileNavigation";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Manage Job",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation />
      <DashboardLayout>
        <ManageJobInfo />
      </DashboardLayout>
    </>
  );
}

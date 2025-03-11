import DashboardLayout from "@/components/store/dashboard/DashboardLayout";
import ManageServiceInfo from "@/components/store/dashboard/section/ManageServiceInfo";

import MobileNavigation from "@/components/store/header/MobileNavigation";

export const metadata = {
  title:
    "Freeio - Freelance Marketplace React/Next Js Template | Manage Services",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation />
      <DashboardLayout>
        <ManageServiceInfo />
      </DashboardLayout>
    </>
  );
}

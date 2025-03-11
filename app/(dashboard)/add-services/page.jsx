import DashboardLayout from "@/components/store/dashboard/DashboardLayout";
import AddServiceInfo from "@/components/store/dashboard/section/AddServiceInfo";

import MobileNavigation from "@/components/store/header/MobileNavigation";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Add Service",
};

export default function page() {
  return (
    <>
    
      <MobileNavigation />
      <DashboardLayout>
        <AddServiceInfo />
      </DashboardLayout>
    </>
  );
}

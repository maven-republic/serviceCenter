import DashboardLayout from "@/components/store/dashboard/DashboardLayout";
import DashboardInfo from "@/components/store/dashboard/section/DashboardInfo";

import MobileNavigation from "@/components/store/header/MobileNavigation";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Dashboard",
};

export default function page() {
  return (
    <>
    
      <MobileNavigation />
      <DashboardLayout>
        <DashboardInfo />
      </DashboardLayout>
    </>
  );
}

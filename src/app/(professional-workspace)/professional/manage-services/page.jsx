import DashboardLayout from "@/components/professional-workspace/DashboardLayout";
import ManageService from "@/components/dashboard/section/ManageServices";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title:
    "Freeio - Freelance Marketplace React/Next Js Template | Manage Services",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <ManageService />
      </DashboardLayout>
    </>
  );
}

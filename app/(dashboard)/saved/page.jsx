import DashboardLayout from "@/components/store/dashboard/DashboardLayout";
import SavedInfo from "@/components/store/dashboard/section/SavedInfo";

import MobileNavigation from "@/components/store/header/MobileNavigation";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Saved",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation />
      <DashboardLayout>
        <SavedInfo />
      </DashboardLayout>
    </>
  );
}

import DashboardLayout from "@/components/store/dashboard/DashboardLayout";
import CreateProjectInfo from "@/components/store/dashboard/section/CreateProjectInfo";

import MobileNavigation from "@/components/store/header/MobileNavigation";

export const metadata = {
  title:
    "Freeio - Freelance Marketplace React/Next Js Template | Create Project",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation />
      <DashboardLayout>
        <CreateProjectInfo />
      </DashboardLayout>
    </>
  );
}

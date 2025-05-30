import DashboardLayout from "@/components/professional-workspace/DashboardLayout";
import StatementInfo from "@/components/professional-workspace/section/StatementInfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Statement",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <DashboardLayout>
        <StatementInfo />
      </DashboardLayout>
    </>
  );
}


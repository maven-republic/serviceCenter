import DashboardLayout from "@/components/store/dashboard/DashboardLayout";
import ProposalInfo from "@/components/store/dashboard/section/ProposalInfo";

import MobileNavigation from "@/components/store/header/MobileNavigation";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Proposal",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation />
      <DashboardLayout>
        <ProposalInfo />
      </DashboardLayout>
    </>
  );
}

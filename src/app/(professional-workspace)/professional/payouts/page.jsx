import ProfessionalWorkspace from "@/components/professional-workspace/ProfessionalWorkspace";
import PayoutInfo from "@/components/professional-workspace/section/PayoutInfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";
export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Payout",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <ProfessionalWorkspace>
        <PayoutInfo />
      </ProfessionalWorkspace>
    </>
  );
}


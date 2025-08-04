import ProfessionalWorkspace from "@/components/professional-workspace/ProfessionalWorkspace";
import ProfessionalPricingManager from "@/components/professional-workspace/section/ManageServices";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title:
    "Freeio - Freelance Marketplace React/Next Js Template | Manage Services",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <ProfessionalWorkspace>
        <ProfessionalPricingManager />
      </ProfessionalWorkspace>
    </>
  );
}


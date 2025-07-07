import ProfessionalWorkspace from "@/components/professional-workspace/ProfessionalWorkspace";
import ProposalInfo from "@/components/professional-workspace/section/ProposalInfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Proposal",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <ProfessionalWorkspace>
        <ProposalInfo />
      </ProfessionalWorkspace>
    </>
  );
}


import ProfessionalWorkspace from "@/components/professional-workspace/ProfessionalWorkspace";
import ManageJobInfo from "@/components/professional-workspace/section/ManageJobInfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Manage Job",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <ProfessionalWorkspace>
        <ManageJobInfo />
      </ProfessionalWorkspace>
    </>
  );
}


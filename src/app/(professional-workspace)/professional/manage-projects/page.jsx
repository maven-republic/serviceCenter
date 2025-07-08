import ProfessionalWorkspace from "@/components/professional-workspace/ProfessionalWorkspace";
import ManageProjectInfo from "@/components/professional-workspace/section/ManageProjectInfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title:
    "Freeio - Freelance Marketplace React/Next Js Template | Manage Project",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <ProfessionalWorkspace>
        <ManageProjectInfo />
      </ProfessionalWorkspace>
    </>
  );
}


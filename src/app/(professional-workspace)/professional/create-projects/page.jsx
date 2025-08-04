import ProfessionalWorkspace from "@/components/professional-workspace/ProfessionalWorkspace";
import CreateProjectInfo from "@/components/professional-workspace/section/CreateProjectInfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title:
    "Freeio - Freelance Marketplace React/Next Js Template | Create Project",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <ProfessionalWorkspace>
        <CreateProjectInfo />
      </ProfessionalWorkspace>
    </>
  );
}


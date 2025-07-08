import ProfessionalWorkspace from "@/components/professional-workspace/ProfessionalWorkspace";
import SavedInfo from "@/components/professional-workspace/section/SavedInfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Saved",
};

export default function page() {
  return (
    <>
    
    <MobileNavigation2 />
      <ProfessionalWorkspace>
        <SavedInfo />
      </ProfessionalWorkspace>
    </>
  );
}

